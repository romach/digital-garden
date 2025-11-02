// Lightweight PlantUML renderer using Kroki
// Scans for <code class="plantuml"> blocks and replaces them with inline SVG

// Minimal utility similar to other inline scripts
function onReady(fn: () => void) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true })
  } else {
    fn()
  }
}

function getSourceFromNode(code: HTMLElement): string {
  const attr = code.getAttribute("data-clipboard")
  if (attr) {
    try {
      // value was stored with JSON.stringify in the transformer
      return JSON.parse(attr)
    } catch {
      // fallback to raw attribute
      return attr
    }
  }
  return code.textContent || ""
}

async function renderPlantUml() {
  // support SPA navigation like mermaid script does
  const center = document.getElementById("center-content") ?? document
  const nodes = center.querySelectorAll("code.plantuml") as NodeListOf<HTMLElement>
  if (nodes.length === 0) return

  const serverUrl = (document.documentElement.getAttribute("data-plantuml-server") || "https://kroki.io").replace(/\/$/, "")
  const format = document.documentElement.getAttribute("data-plantuml-format") || "svg"

  for (const code of nodes) {
    // avoid double-render on SPA navigations (and race with initial nav event)
    const renderedState = code.getAttribute("data-plantuml-rendered")
    if (renderedState === "true" || renderedState === "rendering") continue

    const src = getSourceFromNode(code)
    if (!src.trim()) continue

    // mark as rendering immediately to make the operation idempotent across events
    code.setAttribute("data-plantuml-rendered", "rendering")

    // Create a placeholder container to avoid layout shifts
    // Insert before the enclosing <pre> if it exists (so we can remove the whole pre/copy UI)
    const preWrapper = code.closest('pre') as HTMLElement | null
    const insertionPoint = preWrapper ?? code

    // Reuse an existing sibling container if present to prevent duplicates
    let container = insertionPoint.previousElementSibling as HTMLElement | null
    if (!container || !container.classList.contains("plantuml-diagram")) {
      container = document.createElement("div")
      container.className = "plantuml-diagram"
      insertionPoint.parentElement?.insertBefore(container, insertionPoint)
    } else {
      container.innerHTML = ""
    }

    // Hide original source while rendering (we'll remove it after success)
    if (preWrapper) {
      preWrapper.style.display = "none"
    } else {
      code.style.display = "none"
    }

    try {
      const res = await fetch(`${serverUrl}/plantuml/${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "Accept": format === "svg" ? "image/svg+xml" : "image/png",
        },
        body: src,
      })
      if (!res.ok) throw new Error(`Kroki error: ${res.status} ${res.statusText}`)

      if (format === "svg") {
        const svgText = await res.text()
        container.innerHTML = svgText
        // Make SVG responsive and theme-robust
        const svg = container.querySelector("svg") as SVGElement | null
        if (svg) {
          // Use intrinsic size provided by SVG attributes from Kroki. Do not stretch to full width.
          // Ensure global styles don't constrain it.
          svg.style.maxWidth = "none"
          svg.style.height = ""
          svg.style.width = ""
          svg.setAttribute("preserveAspectRatio", "xMidYMid meet")

          // Force text to render black regardless of site theme.
          // Some themes set `color` on inline SVG, and PlantUML sometimes inherits it via `currentColor`.
          // We set the SVG-level `color` and inject an inline stylesheet to lock text fill to black.
          svg.setAttribute("color", "#000")
          try {
            const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style")
            styleEl.textContent = `text, tspan { fill: #000 !important; color: #000 !important; }`
            svg.insertBefore(styleEl, svg.firstChild)
          } catch {}
        }
      } else {
        // png fallback
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => {
          URL.revokeObjectURL(url)
          // Use intrinsic raster size; do not force full-width
          img.width = img.naturalWidth
          img.height = img.naturalHeight
        }
        img.src = url
        container.appendChild(img)
      }

      // mark as rendered to prevent duplicates on SPA nav
      code.setAttribute("data-plantuml-rendered", "true")

      // Remove the original source block and any enclosing <pre> (which may include a copy button)
      const preWrapper = code.closest('pre') as HTMLElement | null
      if (preWrapper && preWrapper.parentElement) {
        preWrapper.remove()
      } else if (code.parentElement) {
        code.remove()
      }
    } catch (e) {
      const pre = document.createElement("pre")
      pre.textContent = `Failed to render PlantUML diagram: ${String(e)}`
      pre.style.color = "var(--red, #c00)"
      container.appendChild(pre)
      // Unhide source to help debugging
      code.style.display = "block"
      // Clear rendering flag so future tries can attempt again
      code.removeAttribute("data-plantuml-rendered")
    }
  }
}

onReady(() => {
  renderPlantUml()
  document.addEventListener("nav", () => renderPlantUml())
})
