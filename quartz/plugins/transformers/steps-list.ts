import { QuartzTransformerPlugin } from "../types"
import { Root as MdastRoot } from "mdast"
import { visit } from "unist-util-visit"

export const StepsList: QuartzTransformerPlugin = () => {
  return {
    name: "StepsList",
    markdownPlugins() {
      return [
        () => {
          return (tree: MdastRoot, _file) => {
            let foundStepsComment = false

            visit(tree, (node, index, parent) => {
              // Mark HTML comments that say "steps"
              if (node.type === 'html' && node.value.trim() === '<!-- steps -->') {
                foundStepsComment = true
                // Remove the comment
                if (parent && index !== undefined) {
                  parent.children.splice(index, 1)
                  return index
                }
              }

              // Apply to the next ordered list
              if (foundStepsComment && node.type === 'list' && node.ordered) {
                node.data = node.data || {}
                node.data.hProperties = node.data.hProperties || {}
                node.data.hProperties.className = ['steps']
                foundStepsComment = false // Reset the flag
              }
            })
          }
        }
      ]
    }
  }
}
