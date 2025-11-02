import { QuartzTransformerPlugin } from "../types"
import { Root, Code } from "mdast"
import { visit } from "unist-util-visit"
import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

export type PlantUmlSsrOptions = {
  enabled?: boolean
  serverUrl?: string // e.g. https://kroki.io
  format?: "svg" | "png"
  languages?: string[]
  cacheDir?: string // e.g. ".quartz-cache/plantuml"
  assetDir?: string // where to write image assets for PNG/SVG files
  inlineSvg?: boolean // if true and format==svg, inline the SVG into HTML
}

const defaults: Required<PlantUmlSsrOptions> = {
  enabled: true,
  serverUrl: "https://kroki.io",
  format: "svg",
  languages: ["plantuml", "puml", "uml"],
  cacheDir: ".quartz-cache/plantuml",
  assetDir: "public/assets/plantuml",
  inlineSvg: true,
}

export const PlantUML_SSR: QuartzTransformerPlugin<PlantUmlSsrOptions> = (user) => {
  const opts = { ...defaults, ...(user ?? {}) }

  return {
    name: "PlantUML_SSR",
    markdownPlugins() {
      if (!opts.enabled) return []

      const fetchKroki = async (src: string, format: "svg" | "png") => {
        const res = await fetch(`${opts.serverUrl.replace(/\/$/, "")}/plantuml/${format}`, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            Accept: format === "svg" ? "image/svg+xml" : "image/png",
          },
          body: src,
        })
        if (!res.ok) throw new Error(`Kroki error ${res.status} ${res.statusText}`)
        return format === "svg" ? await res.text() : Buffer.from(await res.arrayBuffer())
      }

      const plugin = () => async (tree: Root, file: any) => {
        // Ensure directories exist at processing time
        await fs.mkdir(opts.cacheDir, { recursive: true })
        await fs.mkdir(opts.assetDir, { recursive: true })

        const tasks: Promise<void>[] = []

        visit(tree, "code", (node: Code) => {
          if (!node.lang || !opts.languages.includes(node.lang)) return
          const src = node.value || ""
          if (!src.trim()) return

          const hash = crypto.createHash("sha1").update(`v1\0${opts.format}\0${src}`).digest("hex")
          const cacheSvg = path.join(opts.cacheDir, `${hash}.svg`)
          const cachePng = path.join(opts.cacheDir, `${hash}.png`)

          tasks.push((async () => {
            try {
              if (opts.format === "svg") {
                let svgText: string
                try {
                  svgText = await fs.readFile(cacheSvg, "utf8")
                } catch {
                  svgText = String(await fetchKroki(src, "svg"))
                  await fs.writeFile(cacheSvg, svgText, "utf8")
                }

                if (opts.inlineSvg) {
                  // Make inline SVG responsive to parent container width
                  const responsiveSvg = (() => {
                    const addResponsive = (input: string) => input.replace(/<svg\b([^>]*)>/i, (m, attrs) => {
                      let a = attrs
                        .replace(/\swidth=\"[^\"]*\"/i, "")
                        .replace(/\sheight=\"[^\"]*\"/i, "")
                      if (/style=\"/i.test(a)) {
                        a = a.replace(/style=\"([^\"]*)\"/i, 'style="$1;max-width:100%;height:auto"')
                      } else {
                        a += ' style="max-width:100%;height:auto"'
                      }
                      if (!/preserveAspectRatio=/i.test(a)) {
                        a += ' preserveAspectRatio="xMidYMid meet"'
                      }
                      return `<svg${a}>`
                    })
                    return addResponsive(svgText)
                  })()

                  // Replace code block with raw HTML containing the SVG
                  // @ts-ignore
                  node.type = "html"
                  // @ts-ignore
                  node.value = responsiveSvg
                  // cleanup properties remark might expect
                  // @ts-ignore
                  delete (node as any).lang
                  // @ts-ignore
                  delete (node as any).meta
                } else {
                  const assetPath = path.join(opts.assetDir, `${hash}.svg`)
                  const relSrc = `/assets/plantuml/${hash}.svg`
                  try {
                    await fs.access(assetPath)
                  } catch {
                    await fs.writeFile(assetPath, svgText, "utf8")
                  }
                  // @ts-ignore
                  node.type = "html"
                  // @ts-ignore
                  node.value = `<img class=\"plantuml\" src=\"${relSrc}\" alt=\"PlantUML diagram\" style=\"max-width:100%;height:auto\" />`
                }
              } else {
                let pngBuf: Buffer
                try {
                  pngBuf = await fs.readFile(cachePng)
                } catch {
                  pngBuf = Buffer.from(await fetchKroki(src, "png") as Buffer)
                  await fs.writeFile(cachePng, pngBuf)
                }
                const assetPath = path.join(opts.assetDir, `${hash}.png`)
                const relSrc = `/assets/plantuml/${hash}.png`
                try {
                  await fs.access(assetPath)
                } catch {
                  await fs.writeFile(assetPath, pngBuf)
                }
                // @ts-ignore
                node.type = "html"
                // @ts-ignore
                node.value = `<img class=\"plantuml\" src=\"${relSrc}\" alt=\"PlantUML diagram\" style=\"max-width:100%;height:auto\" />`
              }
            } catch (e) {
              // leave original code block in place and annotate error
              file.data.plantumlError = String(e)
            }
          })())
        })

        await Promise.all(tasks)
      }

      return [plugin]
    },
    htmlPlugins() {
      return []
    },
    externalResources() {
      return { js: [], css: [] }
    },
  }
}

declare module "vfile" {
  interface DataMap {
    plantumlError?: string
  }
}
