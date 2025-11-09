import { QuartzTransformerPlugin } from "../types"
import { Root, Code } from "mdast"
import { visit } from "unist-util-visit"
import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import { deflateRawSync } from "node:zlib"

export type PlantUmlSsrOptions = {
  enabled?: boolean
  serverUrl?: string // e.g. https://www.plantuml.com/plantuml
  format?: "svg" | "png"
  languages?: string[]
  cacheDir?: string // e.g. ".quartz-cache/plantuml"
  assetDir?: string // where to write image assets for PNG/SVG files
  inlineSvg?: boolean // if true and format==svg, inline the SVG into HTML
  wrapWithLink?: boolean // when inlining SVG, wrap it in a link to the saved asset
}

const defaults: Required<PlantUmlSsrOptions> = {
  enabled: true,
  serverUrl: "https://www.plantuml.com/plantuml",
  format: "svg",
  languages: ["plantuml", "puml", "uml"],
  cacheDir: ".quartz-cache/plantuml",
  assetDir: "public/assets/plantuml",
  inlineSvg: true,
  wrapWithLink: true,
}

export const PlantUML_SSR: QuartzTransformerPlugin<PlantUmlSsrOptions> = (user) => {
  const opts = { ...defaults, ...(user ?? {}) }

  return {
    name: "PlantUML_SSR",
    markdownPlugins() {
      if (!opts.enabled) return []

      const PLANTUML_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
      const encode6bit = (b: number) => PLANTUML_ALPHABET.charAt(b & 0x3f)
      const append3bytes = (b1: number, b2: number, b3: number) => {
        const c1 = b1 >> 2
        const c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
        const c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
        const c4 = b3 & 0x3F
        return encode6bit(c1) + encode6bit(c2) + encode6bit(c3) + encode6bit(c4)
      }
      const encode64 = (data: Buffer) => {
        let r = ""
        for (let i = 0; i < data.length; i += 3) {
          if (i + 2 === data.length) {
            r += append3bytes(data[i], data[i + 1], 0)
          } else if (i + 1 === data.length) {
            r += append3bytes(data[i], 0, 0)
          } else {
            r += append3bytes(data[i], data[i + 1], data[i + 2])
          }
        }
        return r
      }

      const encodePlantUml = (text: string) => {
        const buf = Buffer.from(text, "utf8")
        const deflated = deflateRawSync(buf)
        return encode64(deflated)
      }

      const fetchPlantUml = async (src: string, format: "svg" | "png") => {
        const base = opts.serverUrl.replace(/\/$/, "")
        // Try POST first
        try {
          const postRes = await fetch(`${base}/${format}`, {
            method: "POST",
            headers: {
              "Content-Type": "text/plain",
              Accept: format === "svg" ? "image/svg+xml" : "image/png",
            },
            body: src,
          })
          if (postRes.ok) {
            const ct = postRes.headers.get("content-type") || ""
            if (format === "svg" && ct.includes("image/svg")) {
              return await postRes.text()
            } else if (format === "png" && (ct.includes("image/png") || ct === "")) {
              return Buffer.from(await postRes.arrayBuffer())
            }
            // Unexpected content-type, fall back below
          }
        } catch (_) {
          // ignore and try GET fallback
        }
        // Fallback to GET with encoded text
        const encoded = encodePlantUml(src)
        const getRes = await fetch(`${base}/${format}/${encoded}`)
        if (!getRes.ok) throw new Error(`PlantUML server error ${getRes.status} ${getRes.statusText}`)
        return format === "svg" ? await getRes.text() : Buffer.from(await getRes.arrayBuffer())
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

          const hash = crypto
            .createHash("sha1")
            .update(`v3\0${opts.serverUrl}\0${opts.format}\0${src}`)
            .digest("hex")
          const cacheSvg = path.join(opts.cacheDir, `${hash}.svg`)
          const cachePng = path.join(opts.cacheDir, `${hash}.png`)

          tasks.push((async () => {
            try {
              if (opts.format === "svg") {
                let svgText: string
                try {
                  svgText = await fs.readFile(cacheSvg, "utf8")
                } catch {
                  svgText = String(await fetchPlantUml(src, "svg"))
                  await fs.writeFile(cacheSvg, svgText, "utf8")
                }

                if (opts.inlineSvg) {
                  // Make inline SVG responsive to parent container width
                  const responsiveSvg = (() => {
                    const addResponsive = (input: string) => input.replace(/<svg\b([^>]*)>/i, (_m, attrs) => {
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

                  // Ensure an asset exists for opening in a new tab
                  const assetPath = path.join(opts.assetDir, `${hash}.svg`)
                  const relSrc = `/assets/plantuml/${hash}.svg`
                  try {
                    await fs.access(assetPath)
                  } catch {
                    await fs.writeFile(assetPath, svgText, "utf8")
                  }

                  // Replace code block with raw HTML. Optionally wrap inline SVG with a link to the saved asset
                  // @ts-ignore
                  node.type = "html"
                  // @ts-ignore
                  node.value = opts.wrapWithLink
                    ? `<a href="${relSrc}" target="_blank" rel="noopener noreferrer" data-no-popover="true" class="plantuml-link" style="all:unset;cursor:pointer;display:inline-block">${responsiveSvg}</a>`
                    : `${responsiveSvg}`
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
                  node.value = `<a href=\"${relSrc}\" target=\"_blank\" rel=\"noopener noreferrer\" data-no-popover=\"true\" class=\"plantuml-link\" style=\"all:unset;cursor:pointer;display:inline-block\"><img class=\"plantuml\" src=\"${relSrc}\" alt=\"PlantUML diagram\" style=\"max-width:100%;height:auto;cursor:pointer\" /></a>`
                }
              } else {
                let pngBuf: Buffer
                try {
                  pngBuf = await fs.readFile(cachePng)
                } catch {
                  pngBuf = Buffer.from(await fetchPlantUml(src, "png") as Buffer)
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
                node.value = `<a href=\"${relSrc}\" target=\"_blank\" rel=\"noopener noreferrer\" data-no-popover=\"true\" class=\"plantuml-link\" style=\"all:unset;cursor:pointer;display:inline-block\"><img class=\"plantuml\" src=\"${relSrc}\" alt=\"PlantUML diagram\" style=\"max-width:100%;height:auto;cursor:pointer\" /></a>`
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
