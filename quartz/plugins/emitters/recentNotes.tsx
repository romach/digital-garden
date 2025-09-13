import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { FullPageLayout } from "../../cfg"
import { FullSlug } from "../../util/path"
import { sharedPageComponents, defaultListPageLayout } from "../../../quartz.layout"
import * as Component from "../../components"
import { defaultProcessedContent } from "../vfile"
import { write } from "./helpers"
import { i18n } from "../../i18n"

export const RecentNotesPage: QuartzEmitterPlugin = () => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    pageBody: Component.RecentNotes({title: "", showTags: true }),
    beforeBody: defaultListPageLayout.beforeBody,
    left: defaultListPageLayout.left,
    right: defaultListPageLayout.right,
  }

  const { head: Head, pageBody, footer: Footer } = opts
  const Body = BodyConstructor()

  return {
    name: "RecentNotesPage",
    getQuartzComponents() {
      return [Head, Body, pageBody, Footer]
    },
    async *emit(ctx, content, resources) {
      const cfg = ctx.cfg.configuration
      const slug = "recent-notes" as FullSlug

      const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
      const path = url.pathname as FullSlug
      const title = i18n(cfg.locale).components.recentNotes.title
      const [tree, vfile] = defaultProcessedContent({
        slug,
        text: title,
        description: title,
        frontmatter: { title, tags: [] },
      })
      const externalResources = pageResources(path, resources)
      const componentData: QuartzComponentProps = {
        ctx,
        fileData: vfile.data,
        externalResources,
        cfg,
        children: [],
        tree,
        // Only include files with a defined slug to avoid resolveRelative errors
        // Additionally, ensure each file has a title by falling back to its filename when missing.
        allFiles: content
          .map(([_tree, vfile]) => vfile.data)
          .filter((f) => f.slug !== undefined)
          .map((f) => {
            const slug = f.slug as string
            const fallbackTitle = slug.split("/").pop() ?? ""
            const fm = f.frontmatter ?? {}
            if (!fm.title || fm.title.trim() === "") {
              // Assign a derived title into frontmatter so components relying on it work unchanged
              f.frontmatter = { ...fm, title: fallbackTitle }
            }
            return f
          }),
      }

      yield write({
        ctx,
        content: renderPage(cfg, slug, componentData, opts, externalResources),
        slug,
        ext: ".html",
      })
    },
    async *partialEmit() {},
  }
}
