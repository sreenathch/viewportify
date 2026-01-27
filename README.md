# 🖥️ Viewportify

> **The Ultimate Cross-Platform Viewport Toolkit**

[![npm version](https://img.shields.io/npm/v/viewportify.svg)](https://www.npmjs.com/package/viewportify)
[![bundle size](https://img.shields.io/bundlephobia/minzip/viewportify)](https://bundlephobia.com/package/viewportify)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Stop fighting with `window.innerHeight` on iOS!** Viewportify provides consistent, accurate viewport dimensions across all platforms and browsers—including the infamous iOS Safari toolbar issue.

## ✨ Why Viewportify?

| Problem | Viewportify Solution |
|---------|---------------------|
| `100vh` is broken on iOS Safari | ✅ Accurate `100vh` value that accounts for toolbar |
| `window.innerHeight` changes on scroll | ✅ Stable `svh`, `lvh`, `dvh` measurements |
| No native svh/lvh/dvh support | ✅ JavaScript polyfill with CSS variables |
| Keyboard detection on mobile | ✅ Built-in keyboard visibility tracking |
| Safe area insets for notches | ✅ Easy access to safe area values |
| Responsive breakpoints | ✅ Tailwind-style breakpoint system |
| React integration | ✅ Ready-to-use hooks |
| **Need width/height on resize** | ✅ `useWindowSize()` hook updates on resize |
| **Measure element by ref** | ✅ `useElementSize(ref)` returns exact dimensions |
| **Non-React resize listener** | ✅ `onWindowResize()` with debounce support |

## 🚀 Quick Start

```bash
npm install viewportify
```

```javascript
import { getHeight, getWidth, isMobile, isIOS } from 'viewportify';

// Get accurate viewport dimensions (works on iOS!)
console.log(getWidth());   // 390
console.log(getHeight());  // 844 (correct even with Safari toolbar!)

// Device detection
console.log(isMobile());   // true
console.log(isIOS());      // true
```

## 📦 Installation

```bash
# npm
npm install viewportify

# yarn
yarn add viewportify

# pnpm
pnpm add viewportify
```

### CDN (UMD)

```html
<script src="https://unpkg.com/viewportify/dist/index.umd.min.js"></script>
<script>
  const { getHeight, isMobile } = Viewportify;
  console.log(getHeight());
</script>
```

## 📖 API Reference

### Core Viewport Functions

```javascript
import {
  getWidth,           // Viewport width in pixels
  getHeight,          // Viewport height (accurate for iOS!)
  getInnerWidth,      // window.innerWidth
  getInnerHeight,     // window.innerHeight
  get100vh,           // Accurate 100vh value
  getSvh,             // Small viewport height (toolbar expanded)
  getLvh,             // Large viewport height (toolbar collapsed)
  getDvh,             // Dynamic viewport height
  getDPR,             // Device pixel ratio
  getViewport,        // Full ViewportInfo object
} from 'viewportify';
```

### Device Detection

```javascript
import {
  isMobile,           // true for phones
  isTablet,           // true for tablets
  isDesktop,          // true for desktops
  isIOS,              // true for iPhone/iPad
  isAndroid,          // true for Android devices
  isSafari,           // true for Safari browser
  isTouch,            // true if touch-capable
  isStandalone,       // true if running as PWA
} from 'viewportify';
```

### Orientation & Keyboard

```javascript
import {
  getOrientation,     // 'portrait' | 'landscape'
  isKeyboardVisible,  // true when keyboard is open (mobile)
  getKeyboardHeight,  // Estimated keyboard height in pixels
} from 'viewportify';
```

### Safe Area & Scrollbar

```javascript
import { getSafeArea, getScrollbarWidth } from 'viewportify';

const safeArea = getSafeArea();
// { top: 47, right: 0, bottom: 34, left: 0 }

const scrollbar = getScrollbarWidth();
// 17 (Windows), 0 (macOS with overlay scrollbars)
```

### Breakpoints

```javascript
import {
  getCurrentBreakpoint,
  matchesBreakpoint,
} from 'viewportify';

// Tailwind-style breakpoints: xs, sm, md, lg, xl, 2xl
console.log(getCurrentBreakpoint());  // 'lg'
console.log(matchesBreakpoint('md')); // true if >= 768px
```

### Full Instance API

```javascript
import { Viewportify } from 'viewportify';

const vp = new Viewportify({
  debounceTime: 100,           // Resize event debounce (ms)
  setCSSVariables: true,       // Auto-set CSS custom properties
  cssPrefix: '--vp',           // CSS variable prefix
  trackKeyboard: true,         // Track keyboard visibility
  iosVhFix: true,              // Apply iOS 100vh fix
  breakpoints: {               // Custom breakpoints
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  onChange: (info) => {        // Viewport change callback
    console.log('Viewport changed:', info);
  },
});

// Get info
console.log(vp.info);

// Subscribe to changes
const unsubscribe = vp.subscribe((info) => {
  console.log('New dimensions:', info.width, info.height);
});

// Breakpoint utilities
console.log(vp.getCurrentBreakpoint());  // 'lg'
console.log(vp.isAbove('md'));           // true
console.log(vp.isBelow('xl'));           // true
console.log(vp.isBetween('sm', 'lg'));   // true

// Media query tracking
const darkMode = vp.matchMedia('(prefers-color-scheme: dark)');
console.log(darkMode.matches);
darkMode.subscribe(({ matches }) => {
  console.log('Dark mode:', matches);
});

// Cleanup
unsubscribe();
vp.destroy();
```

## ⚛️ React Hooks

### Basic Hooks

```jsx
import {
  useViewport,
  useBreakpoint,
  useMediaQuery,
  useIsMobile,
  useOrientation,
  useKeyboard,
  useWindowSize,      // NEW: Simple width/height object
  useViewportSize,    // NEW: iOS-accurate width/height
  useElementSize,     // NEW: Measure any element by ref
} from 'viewportify';

function MyComponent() {
  // Full viewport info (re-renders on change)
  const viewport = useViewport();
  
  // Current breakpoint
  const breakpoint = useBreakpoint(); // 'sm' | 'md' | 'lg' | etc.
  
  // Media query
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // Simple device check
  const isMobile = useIsMobile();
  
  // Orientation
  const orientation = useOrientation(); // 'portrait' | 'landscape'
  
  // Keyboard state (mobile)
  const { visible: keyboardVisible, height: keyboardHeight } = useKeyboard();

  return (
    <div style={{ height: viewport.height }}>
      <p>Screen: {viewport.width} x {viewport.height}</p>
      <p>Breakpoint: {breakpoint}</p>
      <p>Mobile: {isMobile ? 'Yes' : 'No'}</p>
      <p>Orientation: {orientation}</p>
      {keyboardVisible && (
        <p>Keyboard height: {keyboardHeight}px</p>
      )}
    </div>
  );
}
```

### useWindowSize - Window Dimensions Hook

Returns `{ width, height }` that **automatically updates on window resize**.

```jsx
import { useWindowSize } from 'viewportify';

function ResponsiveComponent() {
  const { width, height } = useWindowSize();
  
  return (
    <div>
      <p>Window: {width} x {height}</p>
      {width < 768 && <MobileNav />}
      {width >= 768 && <DesktopNav />}
    </div>
  );
}
```

### useViewportSize - iOS-Accurate Dimensions Hook

Same as `useWindowSize` but returns **iOS-accurate height** (handles Safari toolbar issue).

```jsx
import { useViewportSize } from 'viewportify';

function FullscreenHero() {
  const { width, height } = useViewportSize();
  
  // This height works correctly on iOS Safari!
  return (
    <div style={{ width, height, background: 'linear-gradient(...)' }}>
      <h1>Full Screen Hero</h1>
    </div>
  );
}
```

### useElementSize - Measure Any Element by Ref

Pass a ref to any element and get its **exact dimensions**, updating automatically on resize.

```jsx
import { useRef } from 'react';
import { useElementSize } from 'viewportify';

function MeasuredComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useElementSize(containerRef);
  
  return (
    <div ref={containerRef} style={{ width: '50%', padding: 20 }}>
      <p>This container is:</p>
      <p>{size.width}px wide × {size.height}px tall</p>
      <p>Position: ({size.x}, {size.y})</p>
    </div>
  );
}
```

**Returns:**
```typescript
{
  width: number;   // Element width
  height: number;  // Element height
  top: number;     // Distance from viewport top
  left: number;    // Distance from viewport left
  right: number;   // Distance from viewport right edge
  bottom: number;  // Distance from viewport bottom edge
  x: number;       // Same as left
  y: number;       // Same as top
}
```

## 🔄 Window Resize Support (Non-React)

### onWindowResize - Subscribe to Resize Events

```javascript
import { onWindowResize } from 'viewportify';

// Subscribe to resize events
const unsubscribe = onWindowResize(({ width, height }) => {
  console.log(`Window resized: ${width} x ${height}`);
}, {
  debounce: 100,    // Optional: debounce in ms
  immediate: true,  // Optional: call immediately with current size
});

// Later: cleanup
unsubscribe();
```

### observeElementSize - Watch Element Size Changes

```javascript
import { observeElementSize } from 'viewportify';

const element = document.getElementById('my-element');

const observer = observeElementSize(element, (size) => {
  console.log('Element size:', size.width, size.height);
  console.log('Position:', size.x, size.y);
});

// Get current size anytime
console.log(observer.getSize());

// Later: cleanup
observer.disconnect();
```

### getElementSize - One-time Element Measurement

```javascript
import { getElementSize } from 'viewportify';

const element = document.getElementById('my-element');
const size = getElementSize(element);

console.log(size); // { width, height, top, left, right, bottom, x, y }
```
```

## 🎨 CSS Variables

When `setCSSVariables` is enabled (default), Viewportify sets these CSS custom properties on `:root`:

```css
:root {
  /* Basic dimensions */
  --vp-width: 1920px;
  --vp-height: 1080px;
  --vp-vh: 10.8px;         /* 1vh in pixels */
  --vp-vw: 19.2px;         /* 1vw in pixels */
  --vp-vmin: 10.8px;
  --vp-vmax: 19.2px;
  
  /* Modern viewport units (polyfilled) */
  --vp-svh: 900px;         /* Small viewport height */
  --vp-lvh: 1080px;        /* Large viewport height */
  --vp-dvh: 1020px;        /* Dynamic viewport height */
  --vp-svw: 1920px;
  --vp-lvw: 1920px;
  --vp-dvw: 1920px;
  
  /* Safe area insets */
  --vp-safe-top: 47px;
  --vp-safe-right: 0px;
  --vp-safe-bottom: 34px;
  --vp-safe-left: 0px;
  
  /* Extras */
  --vp-scrollbar: 17px;
  --vp-dpr: 2;
  --vp-keyboard-height: 0px;
  
  /* iOS 100vh fix */
  --vh: 10.8px;            /* 1vh accurate for iOS */
}
```

### Using CSS Variables

```css
/* Full-height section that works on iOS */
.hero {
  height: calc(var(--vh, 1vh) * 100);
  /* Or use the direct value */
  height: var(--vp-height);
}

/* Respect safe areas on notched devices */
.content {
  padding-top: var(--vp-safe-top);
  padding-bottom: var(--vp-safe-bottom);
}

/* Full viewport width minus scrollbar */
.full-width {
  width: calc(100vw - var(--vp-scrollbar));
}

/* Adjust for keyboard on mobile */
.chat-input {
  bottom: var(--vp-keyboard-height);
  transition: bottom 0.3s ease;
}
```

## 📊 ViewportInfo Object

The full viewport info object contains:

```typescript
interface ViewportInfo {
  // Basic dimensions
  width: number;           // Viewport width
  height: number;          // Viewport height (iOS-accurate)
  vh: number;              // 1vh in pixels
  vw: number;              // 1vw in pixels
  vmin: number;            // min(vh, vw)
  vmax: number;            // max(vh, vw)
  
  // Modern viewport units
  svh: number;             // Small viewport height
  lvh: number;             // Large viewport height
  dvh: number;             // Dynamic viewport height
  svw: number;             // Small viewport width
  lvw: number;             // Large viewport width
  dvw: number;             // Dynamic viewport width
  
  // Screen info
  screenWidth: number;     // screen.width
  screenHeight: number;    // screen.height
  dpr: number;             // devicePixelRatio
  orientation: 'portrait' | 'landscape';
  
  // Device detection
  isTouch: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isStandalone: boolean;   // PWA mode
  
  // Safe area
  safeArea: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // Scrollbar
  scrollbarWidth: number;
  
  // Keyboard (mobile)
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}
```

## 🔧 Understanding iOS Viewport Issues

On iOS Safari, `window.innerHeight` and `100vh` behave unexpectedly:

1. **Initial load**: Includes the Safari toolbar in the measurement
2. **After scroll**: Toolbar collapses, but `100vh` doesn't update
3. **Result**: Elements set to `100vh` overflow the visible viewport

**Viewportify solves this** by using multiple measurement techniques:

- CSS `100vh` element injection for accurate measurement
- `visualViewport` API for dynamic tracking
- New CSS units (`svh`, `lvh`, `dvh`) when available
- Automatic CSS variable updates

## 📱 Platform Support

| Platform | Support |
|----------|---------|
| Chrome (Desktop) | ✅ Full |
| Firefox (Desktop) | ✅ Full |
| Safari (Desktop) | ✅ Full |
| Edge (Desktop) | ✅ Full |
| Chrome (Android) | ✅ Full |
| Safari (iOS) | ✅ Full (with fixes) |
| Firefox (Android) | ✅ Full |
| Samsung Internet | ✅ Full |
| PWA (All) | ✅ Full |
| SSR (Node.js) | ✅ Safe (returns zeros) |

## 🤝 Comparison with Alternatives

| Feature | Viewportify | ios-inner-height | viewport-dimensions |
|---------|-------------|------------------|---------------------|
| iOS Safari fix | ✅ | ✅ | ❌ |
| svh/lvh/dvh | ✅ | ❌ | ❌ |
| CSS variables | ✅ | ❌ | ❌ |
| React hooks | ✅ | ❌ | ❌ |
| **useWindowSize** | ✅ | ❌ | ❌ |
| **useElementSize (ref)** | ✅ | ❌ | ❌ |
| **Resize subscription** | ✅ | ❌ | ✅ |
| Keyboard detection | ✅ | ❌ | ❌ |
| Safe area insets | ✅ | ❌ | ❌ |
| Breakpoints | ✅ | ❌ | ❌ |
| TypeScript | ✅ | ❌ | ❌ |
| Tree-shakable | ✅ | N/A | ❌ |
| Last updated | 2025 | 2018 | 2014 |
| Bundle size | ~5kb | ~1kb | ~2kb |

## 📝 License

MIT © Viewportify Contributors

---

**Made with ❤️ for developers tired of viewport inconsistencies**

⭐ Star us on GitHub if this saved you time!
