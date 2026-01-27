/**
 * Type declarations for Viewportify
 */

export interface ViewportDimensions {
  width: number;
  height: number;
  vh: number;
  vw: number;
  vmin: number;
  vmax: number;
}

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ViewportInfo extends ViewportDimensions {
  svh: number;
  lvh: number;
  dvh: number;
  svw: number;
  lvw: number;
  dvw: number;
  screenWidth: number;
  screenHeight: number;
  dpr: number;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  safeArea: SafeAreaInsets;
  scrollbarWidth: number;
  isStandalone: boolean;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

export interface BreakpointConfig {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
  [key: string]: number | undefined;
}

export interface ViewportifyOptions {
  debounceTime?: number;
  setCSSVariables?: boolean;
  cssPrefix?: string;
  breakpoints?: BreakpointConfig;
  trackKeyboard?: boolean;
  iosVhFix?: boolean;
  onChange?: (info: ViewportInfo) => void;
  observeElement?: HTMLElement | null;
}

export type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;

export interface MediaQueryState {
  matches: boolean;
  query: string;
}

export declare class Viewportify {
  constructor(options?: ViewportifyOptions);
  get info(): ViewportInfo;
  refresh(): ViewportInfo;
  subscribe(callback: (info: ViewportInfo) => void): () => void;
  matchesBreakpoint(breakpoint: BreakpointKey): boolean;
  getCurrentBreakpoint(): BreakpointKey;
  isBelow(breakpoint: BreakpointKey): boolean;
  isAbove(breakpoint: BreakpointKey): boolean;
  isBetween(min: BreakpointKey, max: BreakpointKey): boolean;
  matchMedia(query: string): MediaQueryState & { subscribe: (cb: (state: MediaQueryState) => void) => () => void };
  destroy(): void;
}

// Singleton functions
export declare function initViewportify(options?: ViewportifyOptions): Viewportify;
export declare function getViewportify(): Viewportify;
export declare function getViewport(): ViewportInfo;
export declare function onViewportChange(callback: (info: ViewportInfo) => void): () => void;

// Convenience getters
export declare function getWidth(): number;
export declare function getHeight(): number;
export declare function getInnerWidth(): number;
export declare function getInnerHeight(): number;
export declare function get100vh(): number;
export declare function getSvh(): number;
export declare function getLvh(): number;
export declare function getDvh(): number;
export declare function getDPR(): number;

// Device detection
export declare function isMobile(): boolean;
export declare function isTablet(): boolean;
export declare function isDesktop(): boolean;
export declare function isIOS(): boolean;
export declare function isAndroid(): boolean;
export declare function isSafari(): boolean;
export declare function isTouch(): boolean;
export declare function isStandalone(): boolean;

// Orientation & keyboard
export declare function getOrientation(): 'portrait' | 'landscape';
export declare function isKeyboardVisible(): boolean;
export declare function getKeyboardHeight(): number;

// Safe area & scrollbar
export declare function getSafeArea(): SafeAreaInsets;
export declare function getScrollbarWidth(): number;

// Breakpoints
export declare function getCurrentBreakpoint(): BreakpointKey;
export declare function matchesBreakpoint(breakpoint: BreakpointKey): boolean;

// React hooks
export declare function useViewport(): ViewportInfo;
export declare function useBreakpoint(): BreakpointKey;
export declare function useMediaQuery(query: string): boolean;
export declare function useIsMobile(): boolean;
export declare function useOrientation(): 'portrait' | 'landscape';
export declare function useKeyboard(): { visible: boolean; height: number };

// Window size hooks (updates on resize)
export declare function useWindowSize(): { width: number; height: number };
export declare function useViewportSize(): { width: number; height: number };

// Element size
export interface ElementSize {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  x: number;
  y: number;
}

// Element size hook - accepts ref, returns size that updates on resize
export declare function useElementSize<T extends HTMLElement = HTMLElement>(
  ref: { current: T | null }
): ElementSize;

// Non-React element size functions
export declare function getElementSize(element: HTMLElement | null): ElementSize;
export declare function observeElementSize(
  element: HTMLElement | null,
  callback: (size: ElementSize) => void
): { disconnect: () => void; getSize: () => ElementSize };

// Window resize subscription (non-React)
export declare function onWindowResize(
  callback: (size: { width: number; height: number }) => void,
  options?: { debounce?: number; immediate?: boolean }
): () => void;

export default Viewportify;
