# SCADA Dashboard — UI Redesign Changelog

## Overview

Full UI overhaul from the original material-style dashboard to a minimalist, precision-instrument SCADA designer inspired by Ignition Maker. Changes span the design token system, layout shell, toolbar, sidebar/tag browser, canvas, and inspector.

---

## 1. `src/index.css` — Design Token System Rewrite

**What changed:**
- Replaced all old CSS variables with a new precision-instrument token set
- Light mode: `--bg-main: #FFFFFF`, `--bg-panel: #FAFAFA`, `--bg-subtle: #F4F4F5`, `--border: #E4E4E7`, `--text-primary: #09090B`, `--accent: #2563EB`
- Dark mode: `--bg-main: #0A0A0A`, `--bg-panel: #111113`, `--bg-subtle: #18181B`, `--border: #27272A`, `--text-primary: #FAFAFA`, `--accent: #3B82F6`
- Status colours kept neutral: `--status-ok: #10B981`, `--status-warn: #F59E0B`, `--status-error: #EF4444`
- Shape tokens: `--radius-sm: 6px`, `--radius-md: 8px`, `--radius-lg: 12px`
- Shadow tokens: `--shadow-sm`, `--shadow-md` (near-absent in light, deeper in dark)

**New utility classes added:**
- `.canvas-dot-grid` — 24px dot pattern via `radial-gradient`
- `.frosted` — `backdrop-filter: blur(10px) saturate(160%)` for floating overlays
- `.theme-transition` — `transition: background-color 0.15s, border-color 0.15s, color 0.15s`
- `.custom-scrollbar` — 4px width, transparent track, subtle thumb

**CSS component styles:**
- `input[type=range]` — 2px track, 11px dot handle styled with `--accent`
- `.joint-paper` — transparent background
- `@keyframes live-pulse` — opacity pulse for the running indicator dot
- `@keyframes dash-flow` — animated link stroke dashoffset

---

## 2. `src/layouts/MainLayout.jsx` — Top Bar Redesign

**What changed:**
- Height: 56px
- Added monochrome SVG mark (four rects at varying opacity) replacing the old logo
- Breadcrumb: `Projects › [editable project name]`
- Project name is an inline `<input>` that auto-sizes to content, highlights on focus, reverts to "Untitled" if cleared
- Right side: `⌘K` shortcut chip, theme toggle (Moon/Sun icons), vertical separator, Run/Running button
- **Run button**: blue accent fill, `Zap` icon, fires `setSimulating(true)`
- **Running button**: shows animated green pulse dot + "Running" label + `Square` stop icon, fires `setSimulating(false)`
- Fixed duplicate `onBlur` attribute warning on the project name input

---

## 3. `src/features/editor/components/EditorToolbar.jsx` — Floating Pill Toolbar

**What changed:**
- Layout changed from edge-to-edge bar to a **centered floating pill**
- Outer div: `justify-content: center`, `position: relative`, `borderBottom`
- Inner pill: `border: 1px solid var(--border)`, `borderRadius: var(--radius-md)`, `boxShadow: var(--shadow-sm)`, `padding: 3px 8px`
- Selection count shown as `position: absolute; right: 16px` text

**Components:**
- `Btn` — 30×30px icon button, `accent-subtle` active background, hover state via inline handlers
- `Sep` — 1×14px hairline divider
- `MenuItem` — overflow menu row with icon + label

**Tools in pill (left to right):**
- Select (MousePointer2), Pan (Hand)
- Separator
- Rectangle, Ellipse, Line, Polygon, Text, Image draw tools
- Separator
- Undo, Redo (disabled when unavailable)
- Alignment buttons (AlignLeft, AlignCenterHorizontal, AlignRight) — only visible when `selectedCount > 1`
- Separator
- `⋯` overflow menu button

**Overflow menu (`⋯`):**
- Closes on outside click (useRef + useEffect pattern)
- Toggle Grid, Snap to Grid
- Bring to Front, Bring Forward, Send Backward, Send to Back
- Group (disabled if < 2 selected), Ungroup
- Save Layout, Load Layout, Export JSON

---

## 4. `src/features/editor/components/EditorSidebar.jsx` — Full Redesign with Tag Browser

**What changed:**
- Completely rewritten from a fixed-width tab bar panel

**Collapsible rail:**
- Expanded state: 280px full panel
- Collapsed state: 48px icon rail showing `PanelLeftOpen` + tab icons (Wrench / Database / Layers)
- Clicking any icon in collapsed rail opens panel on that tab
- `PanelLeftClose` button in header collapses to rail

**Tab control:**
- Replaced underline tab bar with a **segmented control** (pill with raised active segment)
- Tabs: **Components** (`id: 'nodes'`), **Explorer** (`id: 'explorer'`), **Layers** (`id: 'layers'`)
- Tab IDs unchanged from EditorPage state to avoid breaking existing wiring

**Explorer tab — Ignition-style Tag Browser:**
- Search bar filters by tag name, key, or device name
- Three-level tree: Category → Device → Tag
  - Category rows: collapsible, uppercase label, device count badge
  - Device rows: collapsible, device icon from `ICON_MAP`, name + location
  - Tag rows: draggable to canvas, tag name, TypeChip, quality dot, live value
- **Indent guide lines**: 1px `var(--border)` vertical lines at left:16px (category) and left:28px (device) levels, absolutely positioned
- **TypeChip**: color-coded badge — `NUM` (blue), `BOOL` (purple), `STR` (green), 8px monospace font
- **Quality dot**: 5px green circle when tag key exists in `SCADAContext`, grey otherwise
- **Live value**: pulled from `useContext(SCADAContext)` tags object
  - Numbers: `.toFixed(1)`, monospace font
  - Booleans: `TRUE` (green) / `FALSE` (red)
  - Updates automatically every second during simulation
- Bottom bar: `+ Tag` and `+ Device` buttons

**Components tab:**
- "Build Custom Node" gradient button at top
- Toolbox groups with **sticky section headers** (position: sticky, top: 0, z-index: 1)
- 2-column grid of draggable component cards with icon + label

**Layers tab:**
- Unchanged `LayersPanel` component, with element count header

---

## 5. `src/pages/EditorPage.jsx` — Canvas & Runtime Updates

**Canvas background:**
- Initial `canvasBg` state changed from `#0B0F19`/`#EEF2F6` → `#0A0A0A`/`#FAFAFA` (matches new design tokens)
- `useEffect` sync updated to same new values on dark mode change

**JointJS grid color:**
- Changed from `#1e2d40`/`#CBD5E1` → `#27272A`/`#D4D4D8` (matches `--border` tokens)

**Runtime elapsed counter:**
- New state: `runtimeSecs` (integer seconds)
- New ref: `runtimeRef` (holds `setInterval` handle)
- `useEffect` on `isSimulating`: starts 1-second interval on run, clears on stop, resets to 0

**Frosted floating run-mode status bar:**
- Rendered inside the canvas div when `isSimulating === true`
- `position: absolute`, `bottom: 20`, `left: 50%`, `transform: translateX(-50%)`
- `.frosted` class for backdrop blur
- Shows: animated pulse dot + "Running" label, `MM:SS` elapsed time (monospace), node count, Stop button
- Stop button calls `setSimulating(false)` (added to context destructure)

**Context destructure update:**
- Added `setSimulating` to the `useContext(SCADAContext)` destructure in EditorPage

---

---

## 6. `src/features/editor/utils/iconUtils.jsx` — SVG Symbol Overhaul

**`getSymbolImagePath`:**
- Returns `null` for all types — removes all `/HMISymbols/` PNG file dependencies

**`SCADA_SVG_PATHS` — fixed and expanded:**
- Fixed pipe corner joints: elbows now use connected `L` commands (e.g. `M 0,36 L 64,36 L 64,100`) for clean mitered corners; previous version had a visible gap at the bend
- Added 6 new pipe variants:
  - `elbow_bl` — enters from right, exits downward
  - `elbow_tr` — enters from left, exits upward
  - `elbow_tl` — enters from right, exits upward
  - `pipe_tee_h` — main horizontal pipe with branch downward
  - `pipe_tee_v` — main vertical pipe with branch rightward
  - `pipe_cross` — 4-way cross junction
- Added 3 new electrical symbols:
  - `transformer_symbol` — two stacked winding circles with top/bottom terminals (IEC style)
  - `fuse_symbol` — rectangle body with diagonal X mark and terminals
  - `bus_bar` — thick horizontal bus rail with three tap lines

**`ScadaIcons` — new distinct icons added:**
- `ElbowBL`, `ElbowTR`, `ElbowTL` — directional elbow variants using `polyline`
- `TeeH`, `TeeV` — T-junction icons showing main pipe + branch direction
- `Cross` — 4-way pipe cross with all 8 end caps drawn
- `Transformer` — two stacked circles with horizontal coupling line and terminals
- `Fuse` — rectangle with X cross and top/bottom terminals
- `BusBar` — thick `strokeWidth="3"` horizontal line with end caps and three tap stubs

---

## 7. `src/components/canvas/Minimap.jsx` — Rewrite

**What changed:**
- Accepts new `paperRef` prop (passed from EditorPage)
- `paper.scaleContentToFit({ padding: 6, minScale: 0.04, maxScale: 0.6 })` called on every graph `add / remove / change:position / change:size` event — content always fills the minimap regardless of node placement
- RAF loop syncs a **viewport indicator rectangle** (`ref={viewportRef}`) in accent blue over the minimap, showing the exact visible area of the main paper in real time
- Position moved from `bottom-16 left-4` to `bottom-4 right-4` — relocated to the bottom-right corner to make room for the floating tag browser in the bottom-left

---

## 8. `src/features/editor/components/EditorSidebar.jsx` — Drag Ghost Fix

**What changed:**
- Added `makeDragGhost(label)` helper: creates a small blue pill `div` appended to `document.body` at `top: -9999px`, used as the `dataTransfer.setDragImage` target, then immediately removed via `setTimeout`
- Applied to **component toolbox cards** (`onDragStart`) — replaces the browser's default screenshot-style ghost
- Applied to **explorer tag rows** (`onDragStart`) — same fix for tags dragged from the Explorer tab

---

## 9. `src/features/editor/components/NodeInspector.jsx` — Expanded Controls

**Properties tab additions:**
- New **"Component Settings"** accordion for all widget types (identified via `isWidget`):
  - **Unit** field — free-text input for numeric widgets (`tank_level`, `gauge_dial`, `digital_readout`, `temp_display`, `value_control`, `progress_bar`, `battery_level`)
  - **Min / Max** inputs — for `value_control` and `gauge_dial`
  - **Step** range slider — for `value_control`; sets the increment per +/− button press
  - **Decimal Places** dropdown (`0`–`3`) — for `digital_readout` and `temp_display`
  - **Default State** ON/OFF toggle — for `toggle_switch`
  - **Alert Message** text input — for `alert_banner`
- **Lock Position** inline toggle added to the Geometry accordion (all non-link elements)
- Type display moved into a `flex` row alongside the label

**Bindings tab additions:**
- **Live value display** — when a tag is bound and present in context, shows current value in a monospace accent readout box below the dropdown
- **Read/Write indicator** — green label shown for `toggle_switch` and `value_control` confirming bidirectional tag access
- New **"Value Transform"** accordion (collapsed by default) for all numeric widgets:
  - `Scale (×)` and `Offset (+)` number inputs
  - Formula hint: `Display = (tag × scale) + offset`

**Style tab additions:**
- New **"Widget Style"** accordion for non-path widget types:
  - **Show Label** toggle — hides/shows the `CardLabel` at the top of the widget
  - **Show Border** toggle — removes the panel border and shadow
  - **Accent Color** picker (moved here from the old plain "Style" note)
  - **Background Override** color picker
  - **Opacity** range slider
- New **"Symbol Style"** accordion for pipe and electrical path types (`isPipe || isElec`):
  - **Stroke Color** picker — applies directly to `body/stroke`
  - **Stroke Width** range slider (1–12, step 0.5) — applies to `body/strokeWidth`
  - **Dash Pattern** dropdown
  - **Opacity** range slider
- Shared `ToggleRow` sub-component for consistent inline toggle rows throughout the inspector
- Defined `PIPE_TYPES`, `ELEC_TYPES`, `NUMERIC_TYPES`, `NO_BIND_TYPES` constant sets at the top of the file to keep conditional checks readable

---

## 10. `src/components/canvas/ReactWidgetOverlays.jsx` — Inspector Settings Applied

**`Panel` primitive updated:**
- Accepts `showBorder` (bool, default `true`) and `bgColor` (string) props
- When `showBorder=false`: removes `border`, `boxShadow`
- When `bgColor` is set: overrides `backgroundColor`

**Per-widget changes:**
- All widgets read `nodeData.showLabel`, `nodeData.showBorder`, `nodeData.bgColor`, `nodeData.opacity` and pass them to `Panel` / `CardLabel`
- Numeric value resolution: `displayVal = rawVal * (tagScale ?? 1) + (tagOffset ?? 0)` applied before rendering
- `digital_readout` and `temp_display` use `nodeData.decimals ?? 1` in `.toFixed()`
- `value_control` respects `step`, `min`, `max`: buttons clamp to range and increment by `step`
- `value_control` shows `unit` label inside the readout box
- `alert_banner` uses `nodeData.alertMsg` as custom message text when set
- `tank_level` and `progress_bar` use `decimals` for the value label

---

## 11. `src/pages/EditorPage.jsx` — Toolbox Expansion & Wiring

**Imports added:**
- `TagBrowserFloat` from `../components/canvas/TagBrowserFloat`

**`defaultSizes` expanded:**
- Electrical: `transformer_symbol { w:60, h:100 }`, `fuse_symbol { w:60, h:80 }`, `bus_bar { w:180, h:60 }`
- Piping: `elbow_bl/tr/tl { w:80, h:80 }`, `pipe_tee_h { w:120, h:80 }`, `pipe_tee_v { w:80, h:120 }`, `pipe_cross { w:80, h:80 }`

**Toolbox definition expanded:**
- Piping & Routing: 3 items → 9 items — added `elbow_bl`, `elbow_tr`, `elbow_tl`, `pipe_tee_h`, `pipe_tee_v`, `pipe_cross` with directional arrow labels (↘ ↙ ↗ ↖ ↓ →)
- Electrical Substation: 3 items → 6 items — added `transformer_symbol`, `fuse_symbol`, `bus_bar`

**Canvas div:**
- `<TagBrowserFloat isDarkMode={isDarkMode} />` rendered inside the canvas div (always visible, including during simulation)
- `<Minimap>` now receives `paperRef={paperRef}` prop

---

## 12. `src/components/canvas/TagBrowserFloat.jsx` — New File

**Purpose:** Ignition Maker-style floating tag browser anchored to the bottom-left of the canvas.

**Layout & position:**
- `position: absolute; bottom: 16px; left: 16px; z-index: 40`
- Width: 216px; collapses to 32px header via `maxHeight` CSS transition (`0.22s cubic-bezier`)
- Frosted glass background matching canvas overlays: `backdropFilter: blur(10px) saturate(160%)`

**Header:**
- `Tag` icon + "Tag Browser" title + total tag count badge
- Click anywhere on header to collapse/expand

**Search bar:**
- Filters across category names, device names, tag names, and tag keys simultaneously
- `×` clear button appears when search is active

**Tag tree:**
- Three-level collapsible tree: Category → Device → Tag (each level independently toggleable)
- **Category rows** — uppercase label, device count badge, chevron
- **Device rows** — device icon from `ICON_MAP`, device name, location suffix
- **Tag rows** — tag name, `TypeChip` (NUM/BOOL/STR with color coding), quality dot (green = live, grey = no data), live value from `SCADAContext`; boolean values colored green/red
- Indent guide lines at `left: 12px` and `left: 22px` matching the sidebar explorer style

**Drag behavior:**
- Each tag row is `draggable`
- `onDragStart` sets `application/scada` data as `{ t: 'tagNode', props: { tagKey, name } }`
- Uses same `makeDragGhost` blue pill ghost as the sidebar to prevent stock browser drag image

---

## Files Modified (Session 2)

| File | Type of Change |
|------|---------------|
| `src/features/editor/utils/iconUtils.jsx` | SVG path fixes + 9 new paths + 9 new ScadaIcons |
| `src/components/canvas/Minimap.jsx` | Rewrite — auto-fit + viewport rect + moved to bottom-right |
| `src/features/editor/components/EditorSidebar.jsx` | Drag ghost fix for toolbox and explorer rows |
| `src/features/editor/components/NodeInspector.jsx` | Expanded Properties, Bindings, Style tabs |
| `src/components/canvas/ReactWidgetOverlays.jsx` | Apply showLabel/showBorder/bgColor/decimals/tagScale/offset/step/min/max |
| `src/pages/EditorPage.jsx` | Add TagBrowserFloat, expand toolbox, new defaultSizes, pass paperRef to Minimap |
| `src/components/canvas/TagBrowserFloat.jsx` | **New file** — floating Ignition-style tag browser (bottom-left) |

## Files Not Yet Modified (Pending)

| File | Pending Change |
|------|---------------|
| `src/features/editor/components/LayersPanel.jsx` | Hover-only eye/lock toggles, refined typography |
