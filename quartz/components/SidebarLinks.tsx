import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const SidebarLinks: QuartzComponent = ({}: QuartzComponentProps) => {
  // Use absolute path so resolveRelative is not needed from varying slugs
  return (
    <div class="sidebar-links">
      <ul class="section-ul without-margins">
        <li class="section-li">
          <div class="section">
            <div class="desc">
              <a href="/recent-notes" data-no-popover="true">Recent Notes</a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  )
}

export default (() => SidebarLinks) satisfies QuartzComponentConstructor
