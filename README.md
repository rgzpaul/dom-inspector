# DOM Inspector

A lightweight Chrome extension that lets you inspect DOM element hierarchies on any webpage by hovering over elements. View ancestor chains, highlight elements visually, and copy HTML to your clipboard — all without opening DevTools.

## Features

- **Hover Inspection** — Move your mouse over any element on a page to see its DOM ancestor chain displayed in a floating tooltip.
- **Element Highlighting** — Hover over items in the tooltip to highlight the corresponding element on the page with a green outline.
- **Copy HTML** — Click any element in the tooltip to copy its full `outerHTML` to your clipboard.
- **Freeze Tooltip** — Press `Escape` to freeze the tooltip in place so you can interact with it without it following your cursor.
- **Toggle On/Off** — Enable or disable the inspector at any time through the extension popup.
- **Persistent State** — Your enabled/disabled preference is saved across browser sessions and synced across devices via Chrome storage.

## Installation

No build step is required. The extension is written in vanilla JavaScript.

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the `dom-inspector` directory.
6. The DOM Inspector icon will appear in your browser toolbar.

## Usage

### Enabling the Inspector

1. Click the DOM Inspector icon in the Chrome toolbar.
2. Toggle the **Enable** switch to activate the inspector on the current page.

### Inspecting Elements

Once enabled, move your mouse over any element on the page. A dark tooltip will appear near your cursor showing the ancestor chain of the hovered element, from the element itself up through its parents (stopping before `<html>` and `<body>`).

Each entry in the tooltip displays the element's tag name (e.g. `<div>`, `<section>`, `<a>`).

### Highlighting Elements

Hover over any entry in the tooltip to highlight the corresponding DOM element on the page. The highlighted element receives a green outline (`#4CAF50`).

### Copying HTML

Click any entry in the tooltip to copy that element's full `outerHTML` to your clipboard.

### Freezing the Tooltip

- Press `Escape` once to **freeze** the tooltip in place. A green border appears around the tooltip to indicate it is frozen. While frozen, the tooltip stays fixed and you can hover over its entries to highlight elements or click to copy HTML.
- Press `Escape` again to **dismiss** the tooltip and resume normal hovering.

### Disabling the Inspector

Open the popup and toggle the switch off. All event listeners and visual overlays are removed from the page.

## How It Works

### Architecture

The extension consists of three main components:

| File | Role |
|------|------|
| `manifest.json` | Extension configuration (Manifest V3) |
| `content.js` | Content script injected into every page — contains all inspection logic |
| `popup.html` / `popup.js` | Popup UI with the enable/disable toggle |
| `icon.png` | Extension icon (64x64 PNG) |

### Content Script (`content.js`)

The content script is injected into every page at `document_idle`. It remains dormant until enabled via the popup toggle. When enabled, it:

1. Injects a `<style>` element into the page head with styles for the tooltip, tooltip items, and element highlights.
2. Attaches `mousemove` and `keydown` event listeners to the document.
3. On mouse move, traverses the DOM tree upward from the hovered element using `parentElement`, collecting ancestors up to (but not including) `<body>` and `<html>`.
4. Renders a fixed-position tooltip near the cursor listing each ancestor as a clickable item.

When disabled, all event listeners are removed, the tooltip is destroyed, and any element highlights are cleaned up.

### Popup (`popup.js`)

The popup reads the current state from `chrome.storage.sync` on open and updates the toggle accordingly. When the user flips the toggle, it:

1. Saves the new state to `chrome.storage.sync`.
2. Sends a message (`{action: 'toggleInspector', enabled: true/false}`) to the active tab's content script to enable or disable the inspector immediately.

### Communication Flow

```
Popup (popup.js)
  │
  ├── chrome.storage.sync.set()    → Persists state
  └── chrome.tabs.sendMessage()    → Sends toggle message
                                        │
                                        ▼
                                   Content Script (content.js)
                                     ├── enable()   → Attach listeners, inject styles
                                     └── disable()  → Remove listeners, clean up DOM
```

On page load, the content script reads `chrome.storage.sync` directly to restore the previous state without needing a message from the popup.

## Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Persist the inspector's enabled/disabled state across sessions and sync it across devices |
| `clipboardWrite` | Allow copying element HTML to the clipboard when the user clicks a tooltip item |

The extension does not make any network requests, collect any data, or access any sensitive browser APIs beyond the two permissions listed above.

## Project Structure

```
dom-inspector/
├── manifest.json    # Chrome extension manifest (V3)
├── content.js       # Content script with inspection logic
├── popup.html       # Popup UI markup and styles
├── popup.js         # Popup toggle logic
├── icon.png         # Extension icon
└── README.md        # This file
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` (first press) | Freeze the tooltip in place |
| `Escape` (second press) | Dismiss the tooltip |

## Compatibility

- **Browser**: Google Chrome (Manifest V3 compatible)
- **Pages**: Works on any `http://` or `https://` webpage
- **Dependencies**: None — pure vanilla JavaScript with no external libraries

## License

This project does not currently specify a license. Contact the author for usage terms.
