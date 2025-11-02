import { QuartzTransformerPlugin } from "../types"
import { Root, Code } from "mdast"
import { visit } from "unist-util-visit"
import { PluggableList } from "unified"
// @ts-ignore
import plantumlScript from "../../components/scripts/plantuml.inline"

export type PlantUmlOptions = {
  enabled?: boolean
  serverUrl?: string // e.g. https://kroki.io
  format?: "svg" | "png"
  languages?: string[] // code fence languages to detect
}

const defaultOptions: Required<PlantUmlOptions> = {
  enabled: true,
  serverUrl: "https://kroki.io",
  format: "svg",
  languages: ["plantuml", "puml", "uml"],
}

export const PlantUML: QuartzTransformerPlugin<PlantUmlOptions> = (userOpts) => {
  const opts = { ...defaultOptions, ...(userOpts ?? {}) }

  return {
    name: "PlantUML",
    markdownPlugins() {
      if (!opts.enabled) return []
      const plugin = () => {
        return (tree: Root, file: any) => {
          visit(tree, "code", (node: Code) => {
            if (node.lang && opts.languages.includes(node.lang)) {
              file.data.hasPlantUmlDiagram = true
              node.data = {
                hProperties: {
                  className: ["plantuml"],
                  "data-clipboard": JSON.stringify(node.value),
                },
              }
            }
          })
        }
      }
      return [plugin]
    },
    htmlPlugins() {
      return [] as PluggableList
    },
    externalResources() {
      if (!opts.enabled) return { js: [], css: [] }
      const js = [
        {
          script: `document.documentElement.setAttribute('data-plantuml-server', ${JSON.stringify(
            opts.serverUrl,
          )}); document.documentElement.setAttribute('data-plantuml-format', ${JSON.stringify(
            opts.format,
          )});`,
          loadTime: "beforeDOMReady" as const,
          contentType: "inline" as const,
        },
        {
          script: plantumlScript as string,
          loadTime: "afterDOMReady" as const,
          contentType: "inline" as const,
          moduleType: "module" as const,
        },
      ]
      return { js }
    },
  }
}

declare module "vfile" {
  interface DataMap {
    hasPlantUmlDiagram: boolean | undefined
  }
}
