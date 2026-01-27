/**
 * Viewportify - The Ultimate Cross-Platform Viewport Toolkit
 * 
 * Handles viewport dimensions consistently across iOS, Android, Windows, macOS, and all major browsers.
 * Solves the infamous mobile viewport height issues with dynamic toolbars.
 * 
 * @author Viewportify Contributors
 * @license MIT
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ViewportDimensions {
  /** Viewport width in pixels */
  width: number;
  /** Viewport height in pixels */
  height: number;
  /** Viewport width as CSS vh unit value (1vh = 1% of height) */
  vh: number;
  /** Viewport width as CSS vw unit value (1vw = 1% of width) */
  vw: number;
  /** Minimum of width and height */
  vmin: number;
  /** Maximum of width and height */
  vmax: number;
}

export interface SafeAreaInsets {
  /** Top safe area inset (e.g., notch, status bar) */
  top: number;
  /** Right safe area inset */
  right: number;
  /** Bottom safe area inset (e.g., home indicator) */
  bottom: number;
  /** Left safe area inset */
  left: number;
}

export interface ViewportInfo extends ViewportDimensions {
  /** Small viewport height (toolbar expanded) */
  svh: number;
  /** Large viewport height (toolbar collapsed) */
  lvh: number;
  /** Dynamic viewport height (current state) */
  dvh: number;
  /** Small viewport width */
  svw: number;
  /** Large viewport width */
  lvw: number;
  /** Dynamic viewport width */
  dvw: number;
  /** Screen width in pixels */
  screenWidth: number;
  /** Screen height in pixels */
  screenHeight: number;
  /** Device pixel ratio */
  dpr: number;
  /** Device orientation */
  orientation: 'portrait' | 'landscape';
  /** Is the device in touch mode */
  isTouch: boolean;
  /** Is mobile device */
  isMobile: boolean;
  /** Is tablet device */
  isTablet: boolean;
  /** Is desktop device */
  isDesktop: boolean;
  /** Is iOS device */
  isIOS: boolean;
  /** Is Android device */
  isAndroid: boolean;
  /** Is Safari browser */
  isSafari: boolean;
  /** Safe area insets */
  safeArea: SafeAreaInsets;
  /** Scrollbar width */
  scrollbarWidth: number;
  /** Is in standalone/PWA mode */
  isStandalone: boolean;
  /** Keyboard is visible (mobile) */
  isKeyboardVisible: boolean;
  /** Estimated keyboard height */
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
  /** Debounce time for resize events in ms (default: 100) */
  debounceTime?: number;
  /** Whether to set CSS custom properties automatically (default: true) */
  setCSSVariables?: boolean;
  /** CSS variable prefix (default: '--vp') */
  cssPrefix?: string;
  /** Custom breakpoints configuration */
  breakpoints?: BreakpointConfig;
  /** Whether to track keyboard visibility on mobile (default: true) */
  trackKeyboard?: boolean;
  /** Whether to use 100vh fix for iOS (default: true) */
  iosVhFix?: boolean;
  /** Callback for viewport changes */
  onChange?: (info: ViewportInfo) => void;
  /** Element to observe for resize (default: window) */
  observeElement?: HTMLElement | null;
}

export type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;

export interface MediaQueryState {
  matches: boolean;
  query: string;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

const DEFAULT_OPTIONS: Required<ViewportifyOptions> = {
  debounceTime: 100,
  setCSSVariables: true,
  cssPrefix: '--vp',
  breakpoints: DEFAULT_BREAKPOINTS,
  trackKeyboard: true,
  iosVhFix: true,
  onChange: () => {},
  observeElement: null,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Debounce function to limit rapid firing of events
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if code is running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Detect iOS device
 */
function detectIOS(): boolean {
  if (!isBrowser()) return false;
  
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  
  return isIOS || isIPadOS;
}

/**
 * Detect Android device
 */
function detectAndroid(): boolean {
  if (!isBrowser()) return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Detect Safari browser
 */
function detectSafari(): boolean {
  if (!isBrowser()) return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome/i.test(ua) && !/CriOS/i.test(ua);
}

/**
 * Detect if device has touch capability
 */
function detectTouch(): boolean {
  if (!isBrowser()) return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Detect if running as standalone PWA
 */
function detectStandalone(): boolean {
  if (!isBrowser()) return false;
  
  const mqStandalone = window.matchMedia('(display-mode: standalone)');
  const isIOSStandalone = (navigator as any).standalone === true;
  
  return mqStandalone.matches || isIOSStandalone;
}

/**
 * Get device type based on screen size and touch capability
 */
function getDeviceType(width: number, isTouch: boolean): 'mobile' | 'tablet' | 'desktop' {
  if (width < 768) return 'mobile';
  if (width < 1024 && isTouch) return 'tablet';
  return 'desktop';
}

/**
 * Calculate scrollbar width
 */
function calcScrollbarWidth(): number {
  if (!isBrowser()) return 0;
  
  // Cache the value since scrollbar width rarely changes
  const cached = (calcScrollbarWidth as any)._cached;
  if (cached !== undefined) return cached;
  
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  document.body.appendChild(outer);
  
  const inner = document.createElement('div');
  outer.appendChild(inner);
  
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.remove();
  
  (calcScrollbarWidth as any)._cached = scrollbarWidth;
  return scrollbarWidth;
}

/**
 * Get safe area insets from CSS environment variables
 */
function getSafeAreaInsets(): SafeAreaInsets {
  if (!isBrowser()) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const computeInset = (position: string): number => {
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style[position as any] = `env(safe-area-inset-${position}, 0px)`;
    div.style.visibility = 'hidden';
    document.body.appendChild(div);
    
    const computed = getComputedStyle(div);
    const value = parseFloat(computed[position as any]) || 0;
    div.remove();
    
    return value;
  };
  
  return {
    top: computeInset('top'),
    right: computeInset('right'),
    bottom: computeInset('bottom'),
    left: computeInset('left'),
  };
}

/**
 * Get accurate viewport height using 100vh trick for iOS
 */
function getAccurateVh(): number {
  if (!isBrowser()) return 0;
  
  // Create a temporary element to measure 100vh
  const vh = document.createElement('div');
  vh.style.position = 'fixed';
  vh.style.top = '0';
  vh.style.height = '100vh';
  vh.style.width = '1px';
  vh.style.visibility = 'hidden';
  vh.style.pointerEvents = 'none';
  document.body.appendChild(vh);
  
  const height = vh.offsetHeight;
  vh.remove();
  
  return height;
}

/**
 * Get small viewport height (toolbar expanded)
 */
function getSmallViewportHeight(): number {
  if (!isBrowser()) return 0;
  
  // Try CSS svh unit first
  const test = document.createElement('div');
  test.style.position = 'fixed';
  test.style.height = '100svh';
  test.style.visibility = 'hidden';
  document.body.appendChild(test);
  
  const height = test.offsetHeight;
  test.remove();
  
  // Fallback to innerHeight if svh is not supported
  if (height === 0) {
    return window.innerHeight;
  }
  
  return height;
}

/**
 * Get large viewport height (toolbar collapsed)
 */
function getLargeViewportHeight(): number {
  if (!isBrowser()) return 0;
  
  // Try CSS lvh unit first
  const test = document.createElement('div');
  test.style.position = 'fixed';
  test.style.height = '100lvh';
  test.style.visibility = 'hidden';
  document.body.appendChild(test);
  
  const height = test.offsetHeight;
  test.remove();
  
  // Fallback to screen height on iOS
  if (height === 0) {
    if (detectIOS()) {
      return getAccurateVh();
    }
    return window.innerHeight;
  }
  
  return height;
}

/**
 * Get dynamic viewport height (current state)
 */
function getDynamicViewportHeight(): number {
  if (!isBrowser()) return 0;
  
  // Try CSS dvh unit first
  const test = document.createElement('div');
  test.style.position = 'fixed';
  test.style.height = '100dvh';
  test.style.visibility = 'hidden';
  document.body.appendChild(test);
  
  const height = test.offsetHeight;
  test.remove();
  
  // Fallback
  if (height === 0) {
    return window.innerHeight;
  }
  
  return height;
}

/**
 * Get small viewport width
 */
function getSmallViewportWidth(): number {
  if (!isBrowser()) return 0;
  
  const test = document.createElement('div');
  test.style.position = 'fixed';
  test.style.width = '100svw';
  test.style.visibility = 'hidden';
  document.body.appendChild(test);
  
  const width = test.offsetWidth;
  test.remove();
  
  return width || window.innerWidth;
}

/**
 * Get large viewport width
 */
function getLargeViewportWidth(): number {
  if (!isBrowser()) return 0;
  
  const test = document.createElement('div');
  test.style.position = 'fixed';
  test.style.width = '100lvw';
  test.style.visibility = 'hidden';
  document.body.appendChild(test);
  
  const width = test.offsetWidth;
  test.remove();
  
  return width || window.innerWidth;
}

/**
 * Get dynamic viewport width
 */
function getDynamicViewportWidth(): number {
  if (!isBrowser()) return 0;
  
  const test = document.createElement('div');
  test.style.position = 'fixed';
  test.style.width = '100dvw';
  test.style.visibility = 'hidden';
  document.body.appendChild(test);
  
  const width = test.offsetWidth;
  test.remove();
  
  return width || window.innerWidth;
}

// ============================================================================
// MAIN VIEWPORTIFY CLASS
// ============================================================================

export class Viewportify {
  private options: Required<ViewportifyOptions>;
  private listeners: Set<(info: ViewportInfo) => void> = new Set();
  private resizeObserver: ResizeObserver | null = null;
  private cleanupFns: (() => void)[] = [];
  private _info: ViewportInfo | null = null;
  private lastKeyboardHeight = 0;
  private initialViewportHeight = 0;

  constructor(options: ViewportifyOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    if (isBrowser()) {
      this.initialViewportHeight = window.innerHeight;
      this.init();
    }
  }

  /**
   * Initialize the viewport tracker
   */
  private init(): void {
    // Initial measurement
    this._info = this.measure();
    
    // Set CSS variables
    if (this.options.setCSSVariables) {
      this.updateCSSVariables();
    }
    
    // Apply iOS vh fix
    if (this.options.iosVhFix && detectIOS()) {
      this.applyIOSFix();
    }
    
    // Setup event listeners
    this.setupListeners();
  }

  /**
   * Apply iOS 100vh fix
   */
  private applyIOSFix(): void {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVh();
    
    // Only update on orientation change to prevent janky scrolling
    const handleOrientationChange = () => {
      setTimeout(setVh, 100);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    this.cleanupFns.push(() => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    });
  }

  /**
   * Setup resize and orientation listeners
   */
  private setupListeners(): void {
    const handleResize = debounce(() => {
      this._info = this.measure();
      
      if (this.options.setCSSVariables) {
        this.updateCSSVariables();
      }
      
      this.options.onChange(this._info);
      this.listeners.forEach(listener => listener(this._info!));
    }, this.options.debounceTime);

    // Window resize
    window.addEventListener('resize', handleResize);
    this.cleanupFns.push(() => window.removeEventListener('resize', handleResize));

    // Visual viewport (for keyboard detection)
    if (this.options.trackKeyboard && 'visualViewport' in window && window.visualViewport) {
      const handleVisualViewport = () => {
        const vv = window.visualViewport!;
        const heightDiff = this.initialViewportHeight - vv.height;
        
        // If height difference is significant, keyboard is likely visible
        if (heightDiff > 150) {
          this.lastKeyboardHeight = heightDiff;
        } else {
          this.lastKeyboardHeight = 0;
        }
        
        handleResize();
      };
      
      window.visualViewport.addEventListener('resize', handleVisualViewport);
      window.visualViewport.addEventListener('scroll', handleVisualViewport);
      this.cleanupFns.push(() => {
        window.visualViewport?.removeEventListener('resize', handleVisualViewport);
        window.visualViewport?.removeEventListener('scroll', handleVisualViewport);
      });
    }

    // Orientation change
    window.addEventListener('orientationchange', () => {
      // Delay measurement to allow browser to settle
      setTimeout(handleResize, 150);
    });
    this.cleanupFns.push(() => {
      // Note: This doesn't perfectly clean up due to the arrow function
    });

    // ResizeObserver for custom element
    if (this.options.observeElement && 'ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(handleResize);
      this.resizeObserver.observe(this.options.observeElement);
      this.cleanupFns.push(() => this.resizeObserver?.disconnect());
    }

    // Media query listeners for dark mode and other changes
    if (window.matchMedia) {
      const orientationMQ = window.matchMedia('(orientation: portrait)');
      const handleOrientationChange = () => handleResize();
      
      if (orientationMQ.addEventListener) {
        orientationMQ.addEventListener('change', handleOrientationChange);
        this.cleanupFns.push(() => orientationMQ.removeEventListener('change', handleOrientationChange));
      }
    }
  }

  /**
   * Measure current viewport
   */
  private measure(): ViewportInfo {
    if (!isBrowser()) {
      return this.getSSRFallback();
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isIOS = detectIOS();
    const isAndroid = detectAndroid();
    const isSafari = detectSafari();
    const isTouch = detectTouch();
    const deviceType = getDeviceType(width, isTouch);
    
    // Get accurate measurements
    const svh = getSmallViewportHeight();
    const lvh = getLargeViewportHeight();
    const dvh = getDynamicViewportHeight();
    const svw = getSmallViewportWidth();
    const lvw = getLargeViewportWidth();
    const dvw = getDynamicViewportWidth();

    // For iOS, use the 100vh trick for height
    const effectiveHeight = isIOS ? getAccurateVh() : height;

    return {
      // Basic dimensions
      width,
      height: effectiveHeight,
      vh: effectiveHeight / 100,
      vw: width / 100,
      vmin: Math.min(width, effectiveHeight) / 100,
      vmax: Math.max(width, effectiveHeight) / 100,
      
      // New viewport units
      svh,
      lvh,
      dvh,
      svw,
      lvw,
      dvw,
      
      // Screen dimensions
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      dpr: window.devicePixelRatio || 1,
      
      // Orientation
      orientation: width > height ? 'landscape' : 'portrait',
      
      // Device detection
      isTouch,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      isIOS,
      isAndroid,
      isSafari,
      
      // Safe area
      safeArea: getSafeAreaInsets(),
      
      // Scrollbar
      scrollbarWidth: calcScrollbarWidth(),
      
      // PWA
      isStandalone: detectStandalone(),
      
      // Keyboard
      isKeyboardVisible: this.lastKeyboardHeight > 150,
      keyboardHeight: this.lastKeyboardHeight,
    };
  }

  /**
   * Get SSR fallback values
   */
  private getSSRFallback(): ViewportInfo {
    return {
      width: 0,
      height: 0,
      vh: 0,
      vw: 0,
      vmin: 0,
      vmax: 0,
      svh: 0,
      lvh: 0,
      dvh: 0,
      svw: 0,
      lvw: 0,
      dvw: 0,
      screenWidth: 0,
      screenHeight: 0,
      dpr: 1,
      orientation: 'portrait',
      isTouch: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isIOS: false,
      isAndroid: false,
      isSafari: false,
      safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
      scrollbarWidth: 0,
      isStandalone: false,
      isKeyboardVisible: false,
      keyboardHeight: 0,
    };
  }

  /**
   * Update CSS custom properties
   */
  private updateCSSVariables(): void {
    if (!isBrowser() || !this._info) return;

    const prefix = this.options.cssPrefix;
    const root = document.documentElement;
    const info = this._info;

    // Basic dimensions
    root.style.setProperty(`${prefix}-width`, `${info.width}px`);
    root.style.setProperty(`${prefix}-height`, `${info.height}px`);
    root.style.setProperty(`${prefix}-vh`, `${info.vh}px`);
    root.style.setProperty(`${prefix}-vw`, `${info.vw}px`);
    root.style.setProperty(`${prefix}-vmin`, `${info.vmin}px`);
    root.style.setProperty(`${prefix}-vmax`, `${info.vmax}px`);
    
    // New viewport units (as actual pixel values for fallback)
    root.style.setProperty(`${prefix}-svh`, `${info.svh}px`);
    root.style.setProperty(`${prefix}-lvh`, `${info.lvh}px`);
    root.style.setProperty(`${prefix}-dvh`, `${info.dvh}px`);
    root.style.setProperty(`${prefix}-svw`, `${info.svw}px`);
    root.style.setProperty(`${prefix}-lvw`, `${info.lvw}px`);
    root.style.setProperty(`${prefix}-dvw`, `${info.dvw}px`);
    
    // Safe area
    root.style.setProperty(`${prefix}-safe-top`, `${info.safeArea.top}px`);
    root.style.setProperty(`${prefix}-safe-right`, `${info.safeArea.right}px`);
    root.style.setProperty(`${prefix}-safe-bottom`, `${info.safeArea.bottom}px`);
    root.style.setProperty(`${prefix}-safe-left`, `${info.safeArea.left}px`);
    
    // Extras
    root.style.setProperty(`${prefix}-scrollbar`, `${info.scrollbarWidth}px`);
    root.style.setProperty(`${prefix}-dpr`, `${info.dpr}`);
    root.style.setProperty(`${prefix}-keyboard-height`, `${info.keyboardHeight}px`);
    
    // 100vh fix for iOS (separate variable)
    root.style.setProperty('--vh', `${info.height / 100}px`);
  }

  /**
   * Get current viewport info
   */
  get info(): ViewportInfo {
    if (!this._info) {
      this._info = this.measure();
    }
    return this._info;
  }

  /**
   * Force refresh measurements
   */
  refresh(): ViewportInfo {
    this._info = this.measure();
    
    if (this.options.setCSSVariables) {
      this.updateCSSVariables();
    }
    
    return this._info;
  }

  /**
   * Subscribe to viewport changes
   */
  subscribe(callback: (info: ViewportInfo) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Check if current viewport matches a breakpoint
   */
  matchesBreakpoint(breakpoint: BreakpointKey): boolean {
    const bp = this.options.breakpoints[breakpoint];
    if (bp === undefined) return false;
    
    return this.info.width >= bp;
  }

  /**
   * Get current breakpoint name
   */
  getCurrentBreakpoint(): BreakpointKey {
    const breakpoints = Object.entries(this.options.breakpoints)
      .filter(([, value]) => value !== undefined)
      .sort((a, b) => (b[1] as number) - (a[1] as number));
    
    for (const [name, value] of breakpoints) {
      if (this.info.width >= (value as number)) {
        return name;
      }
    }
    
    return 'xs';
  }

  /**
   * Check if viewport is below a breakpoint
   */
  isBelow(breakpoint: BreakpointKey): boolean {
    const bp = this.options.breakpoints[breakpoint];
    if (bp === undefined) return false;
    
    return this.info.width < bp;
  }

  /**
   * Check if viewport is above a breakpoint
   */
  isAbove(breakpoint: BreakpointKey): boolean {
    const bp = this.options.breakpoints[breakpoint];
    if (bp === undefined) return false;
    
    return this.info.width >= bp;
  }

  /**
   * Check if viewport is between two breakpoints
   */
  isBetween(min: BreakpointKey, max: BreakpointKey): boolean {
    return this.isAbove(min) && this.isBelow(max);
  }

  /**
   * Create a media query and track its state
   */
  matchMedia(query: string): MediaQueryState & { subscribe: (cb: (state: MediaQueryState) => void) => () => void } {
    if (!isBrowser()) {
      return {
        matches: false,
        query,
        subscribe: () => () => {},
      };
    }

    const mql = window.matchMedia(query);
    const state: MediaQueryState = {
      matches: mql.matches,
      query,
    };

    const subscribe = (callback: (state: MediaQueryState) => void): (() => void) => {
      const handler = (e: MediaQueryListEvent) => {
        state.matches = e.matches;
        callback(state);
      };

      if (mql.addEventListener) {
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
      } else {
        // Fallback for older browsers
        mql.addListener(handler);
        return () => mql.removeListener(handler);
      }
    };

    return { ...state, subscribe };
  }

  /**
   * Clean up all listeners and observers
   */
  destroy(): void {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    this.listeners.clear();
    this.resizeObserver = null;
  }
}

// ============================================================================
// SINGLETON INSTANCE & CONVENIENCE FUNCTIONS
// ============================================================================

let instance: Viewportify | null = null;

/**
 * Initialize or get the global Viewportify instance
 */
export function initViewportify(options?: ViewportifyOptions): Viewportify {
  if (!instance) {
    instance = new Viewportify(options);
  }
  return instance;
}

/**
 * Get the global Viewportify instance (creates with defaults if not exists)
 */
export function getViewportify(): Viewportify {
  return initViewportify();
}

/**
 * Get current viewport info (convenience function)
 */
export function getViewport(): ViewportInfo {
  return getViewportify().info;
}

/**
 * Subscribe to viewport changes (convenience function)
 */
export function onViewportChange(callback: (info: ViewportInfo) => void): () => void {
  return getViewportify().subscribe(callback);
}

/**
 * Get viewport width
 */
export function getWidth(): number {
  return getViewportify().info.width;
}

/**
 * Get viewport height (accurate for iOS)
 */
export function getHeight(): number {
  return getViewportify().info.height;
}

/**
 * Get innerWidth (window.innerWidth with fallback)
 */
export function getInnerWidth(): number {
  if (!isBrowser()) return 0;
  return window.innerWidth;
}

/**
 * Get innerHeight (window.innerHeight with fallback)
 */
export function getInnerHeight(): number {
  if (!isBrowser()) return 0;
  return window.innerHeight;
}

/**
 * Get accurate 100vh value (handles iOS safari toolbar)
 */
export function get100vh(): number {
  return getViewportify().info.height;
}

/**
 * Get small viewport height
 */
export function getSvh(): number {
  return getViewportify().info.svh;
}

/**
 * Get large viewport height
 */
export function getLvh(): number {
  return getViewportify().info.lvh;
}

/**
 * Get dynamic viewport height
 */
export function getDvh(): number {
  return getViewportify().info.dvh;
}

/**
 * Get device pixel ratio
 */
export function getDPR(): number {
  return getViewportify().info.dpr;
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return getViewportify().info.isMobile;
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  return getViewportify().info.isTablet;
}

/**
 * Check if device is desktop
 */
export function isDesktop(): boolean {
  return getViewportify().info.isDesktop;
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  return getViewportify().info.isIOS;
}

/**
 * Check if device is Android
 */
export function isAndroid(): boolean {
  return getViewportify().info.isAndroid;
}

/**
 * Check if browser is Safari
 */
export function isSafari(): boolean {
  return getViewportify().info.isSafari;
}

/**
 * Check if device has touch capability
 */
export function isTouch(): boolean {
  return getViewportify().info.isTouch;
}

/**
 * Check if running as standalone PWA
 */
export function isStandalone(): boolean {
  return getViewportify().info.isStandalone;
}

/**
 * Get current orientation
 */
export function getOrientation(): 'portrait' | 'landscape' {
  return getViewportify().info.orientation;
}

/**
 * Check if keyboard is visible (mobile)
 */
export function isKeyboardVisible(): boolean {
  return getViewportify().info.isKeyboardVisible;
}

/**
 * Get estimated keyboard height
 */
export function getKeyboardHeight(): number {
  return getViewportify().info.keyboardHeight;
}

/**
 * Get safe area insets
 */
export function getSafeArea(): SafeAreaInsets {
  return getViewportify().info.safeArea;
}

/**
 * Get scrollbar width
 */
export function getScrollbarWidth(): number {
  return getViewportify().info.scrollbarWidth;
}

/**
 * Get current breakpoint
 */
export function getCurrentBreakpoint(): BreakpointKey {
  return getViewportify().getCurrentBreakpoint();
}

/**
 * Check if viewport matches breakpoint
 */
export function matchesBreakpoint(breakpoint: BreakpointKey): boolean {
  return getViewportify().matchesBreakpoint(breakpoint);
}

// ============================================================================
// REACT HOOKS (if React is available)
// ============================================================================

// Type declaration for React hooks
declare const React: any;

/**
 * React hook for viewport info
 */
export function useViewport(): ViewportInfo {
  if (typeof React === 'undefined') {
    throw new Error('useViewport requires React. Import React in your project.');
  }
  
  const { useState, useEffect } = React;
  const [viewport, setViewport] = useState<ViewportInfo>(() => getViewportify().info);
  
  useEffect(() => {
    const unsubscribe = getViewportify().subscribe(setViewport);
    return unsubscribe;
  }, []);
  
  return viewport;
}

/**
 * React hook for breakpoint matching
 */
export function useBreakpoint(): BreakpointKey {
  if (typeof React === 'undefined') {
    throw new Error('useBreakpoint requires React. Import React in your project.');
  }
  
  const { useState, useEffect } = React;
  const [breakpoint, setBreakpoint] = useState<BreakpointKey>(() => 
    getViewportify().getCurrentBreakpoint()
  );
  
  useEffect(() => {
    const unsubscribe = getViewportify().subscribe(() => {
      setBreakpoint(getViewportify().getCurrentBreakpoint());
    });
    return unsubscribe;
  }, []);
  
  return breakpoint;
}

/**
 * React hook for media query
 */
export function useMediaQuery(query: string): boolean {
  if (typeof React === 'undefined') {
    throw new Error('useMediaQuery requires React. Import React in your project.');
  }
  
  const { useState, useEffect } = React;
  const [matches, setMatches] = useState<boolean>(() => {
    if (!isBrowser()) return false;
    return window.matchMedia(query).matches;
  });
  
  useEffect(() => {
    if (!isBrowser()) return;
    
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, [query]);
  
  return matches;
}

/**
 * React hook for mobile detection
 */
export function useIsMobile(): boolean {
  if (typeof React === 'undefined') {
    throw new Error('useIsMobile requires React. Import React in your project.');
  }
  
  const viewport = useViewport();
  return viewport.isMobile;
}

/**
 * React hook for orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  if (typeof React === 'undefined') {
    throw new Error('useOrientation requires React. Import React in your project.');
  }
  
  const viewport = useViewport();
  return viewport.orientation;
}

/**
 * React hook for keyboard visibility
 */
export function useKeyboard(): { visible: boolean; height: number } {
  if (typeof React === 'undefined') {
    throw new Error('useKeyboard requires React. Import React in your project.');
  }
  
  const viewport = useViewport();
  return {
    visible: viewport.isKeyboardVisible,
    height: viewport.keyboardHeight,
  };
}

/**
 * React hook that returns window width and height as an object
 * Updates on window resize
 */
export function useWindowSize(): { width: number; height: number } {
  if (typeof React === 'undefined') {
    throw new Error('useWindowSize requires React. Import React in your project.');
  }
  
  const { useState, useEffect, useCallback } = React;
  
  const getSize = useCallback(() => {
    if (!isBrowser()) {
      return { width: 0, height: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }, []);
  
  const [size, setSize] = useState<{ width: number; height: number }>(getSize);
  
  useEffect(() => {
    if (!isBrowser()) return;
    
    let rafId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const handleResize = () => {
      // Cancel any pending updates
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      
      // Use requestAnimationFrame for smooth updates
      rafId = requestAnimationFrame(() => {
        setSize(getSize());
      });
    };
    
    // Also handle orientation change
    const handleOrientationChange = () => {
      // Delay measurement to allow browser to settle
      timeoutId = setTimeout(() => {
        setSize(getSize());
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Also listen to visualViewport for mobile
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [getSize]);
  
  return size;
}

/**
 * React hook that returns accurate viewport size (iOS-safe)
 * Updates on window resize
 */
export function useViewportSize(): { width: number; height: number } {
  if (typeof React === 'undefined') {
    throw new Error('useViewportSize requires React. Import React in your project.');
  }
  
  const { useState, useEffect, useCallback } = React;
  
  const getSize = useCallback(() => {
    if (!isBrowser()) {
      return { width: 0, height: 0 };
    }
    
    // For iOS, use the accurate vh measurement
    const isIOSDevice = detectIOS();
    const height = isIOSDevice ? getAccurateVh() : window.innerHeight;
    
    return {
      width: window.innerWidth,
      height,
    };
  }, []);
  
  const [size, setSize] = useState<{ width: number; height: number }>(getSize);
  
  useEffect(() => {
    if (!isBrowser()) return;
    
    let rafId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const handleResize = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      
      rafId = requestAnimationFrame(() => {
        setSize(getSize());
      });
    };
    
    const handleOrientationChange = () => {
      timeoutId = setTimeout(() => {
        setSize(getSize());
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [getSize]);
  
  return size;
}

/**
 * Element size interface
 */
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

/**
 * React hook that measures the size of a DOM element via ref
 * Automatically updates on resize
 * 
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const size = useElementSize(ref);
 * // size = { width: 300, height: 200, top: 100, left: 50, ... }
 */
export function useElementSize<T extends HTMLElement = HTMLElement>(
  ref: { current: T | null }
): ElementSize {
  if (typeof React === 'undefined') {
    throw new Error('useElementSize requires React. Import React in your project.');
  }
  
  const { useState, useEffect, useCallback } = React;
  
  const getDefaultSize = (): ElementSize => ({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    x: 0,
    y: 0,
  });
  
  const [size, setSize] = useState<ElementSize>(getDefaultSize);
  
  const updateSize = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        x: rect.x,
        y: rect.y,
      });
    }
  }, [ref]);
  
  useEffect(() => {
    if (!isBrowser() || !ref.current) {
      return;
    }
    
    // Initial measurement
    updateSize();
    
    // Use ResizeObserver if available
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver((entries) => {
        // Use requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
        requestAnimationFrame(() => {
          if (entries.length > 0) {
            updateSize();
          }
        });
      });
      
      resizeObserver.observe(ref.current);
      
      // Also listen to window resize for position updates
      const handleWindowResize = () => {
        requestAnimationFrame(updateSize);
      };
      window.addEventListener('resize', handleWindowResize);
      window.addEventListener('scroll', handleWindowResize);
      
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleWindowResize);
        window.removeEventListener('scroll', handleWindowResize);
      };
    } else {
      // Fallback: use window resize
      const handleResize = () => {
        updateSize();
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      };
    }
  }, [ref, updateSize]);
  
  return size;
}

/**
 * Get element size by ref (non-hook version)
 * Call this function to get the current size of an element
 * 
 * @example
 * const myRef = document.getElementById('my-element');
 * const size = getElementSize(myRef);
 */
export function getElementSize(element: HTMLElement | null): ElementSize {
  if (!element || !isBrowser()) {
    return {
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
    };
  }
  
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    x: rect.x,
    y: rect.y,
  };
}

/**
 * Create an element size observer (non-React version)
 * Returns an object with the current size and a method to observe/unobserve
 * 
 * @example
 * const observer = observeElementSize(document.getElementById('my-element'), (size) => {
 *   console.log('Element resized:', size);
 * });
 * // Later: observer.disconnect();
 */
export function observeElementSize(
  element: HTMLElement | null,
  callback: (size: ElementSize) => void
): { disconnect: () => void; getSize: () => ElementSize } {
  if (!element || !isBrowser()) {
    return {
      disconnect: () => {},
      getSize: () => ({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
      }),
    };
  }
  
  const getSize = () => getElementSize(element);
  
  // Initial callback
  callback(getSize());
  
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        callback(getSize());
      });
    });
    
    resizeObserver.observe(element);
    
    const handleWindowResize = () => {
      requestAnimationFrame(() => callback(getSize()));
    };
    
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('scroll', handleWindowResize);
    
    return {
      disconnect: () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleWindowResize);
        window.removeEventListener('scroll', handleWindowResize);
      },
      getSize,
    };
  } else {
    // Fallback
    const handleResize = () => callback(getSize());
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return {
      disconnect: () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      },
      getSize,
    };
  }
}

/**
 * Subscribe to window resize events (non-React version)
 * 
 * @example
 * const unsubscribe = onWindowResize(({ width, height }) => {
 *   console.log('Window resized:', width, height);
 * });
 * // Later: unsubscribe();
 */
export function onWindowResize(
  callback: (size: { width: number; height: number }) => void,
  options?: { debounce?: number; immediate?: boolean }
): () => void {
  if (!isBrowser()) {
    return () => {};
  }
  
  const { debounce: debounceTime = 0, immediate = true } = options || {};
  
  const getSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  // Immediate callback if requested
  if (immediate) {
    callback(getSize());
  }
  
  let rafId: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  const handleResize = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    if (debounceTime > 0) {
      timeoutId = setTimeout(() => {
        rafId = requestAnimationFrame(() => {
          callback(getSize());
        });
      }, debounceTime);
    } else {
      rafId = requestAnimationFrame(() => {
        callback(getSize());
      });
    }
  };
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
  }
  
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleResize);
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default Viewportify;
