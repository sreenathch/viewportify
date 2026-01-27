import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetWindowMocks } from './setup';

let viewportify: typeof import('../index');

describe('Viewportify Class', () => {
  beforeEach(async () => {
    resetWindowMocks();
    vi.resetModules();
    viewportify = await import('../index');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const vp = new viewportify.Viewportify();
      expect(vp).toBeInstanceOf(viewportify.Viewportify);
      expect(vp.info).toBeDefined();
      vp.destroy();
    });

    it('should accept custom options', () => {
      const onChange = vi.fn();
      const vp = new viewportify.Viewportify({
        debounceTime: 200,
        setCSSVariables: false,
        cssPrefix: '--custom',
        onChange,
      });
      expect(vp).toBeInstanceOf(viewportify.Viewportify);
      vp.destroy();
    });

    it('should accept custom breakpoints', () => {
      const vp = new viewportify.Viewportify({
        breakpoints: {
          xs: 0,
          sm: 480,
          md: 640,
          lg: 960,
          xl: 1200,
        },
      });
      expect(vp).toBeInstanceOf(viewportify.Viewportify);
      vp.destroy();
    });
  });

  describe('info property', () => {
    it('should return ViewportInfo object', () => {
      const vp = new viewportify.Viewportify();
      const info = vp.info;

      expect(info).toHaveProperty('width');
      expect(info).toHaveProperty('height');
      expect(info).toHaveProperty('vh');
      expect(info).toHaveProperty('vw');
      expect(info).toHaveProperty('vmin');
      expect(info).toHaveProperty('vmax');
      expect(info).toHaveProperty('svh');
      expect(info).toHaveProperty('lvh');
      expect(info).toHaveProperty('dvh');
      expect(info).toHaveProperty('orientation');
      expect(info).toHaveProperty('isTouch');
      expect(info).toHaveProperty('isMobile');
      expect(info).toHaveProperty('isTablet');
      expect(info).toHaveProperty('isDesktop');
      expect(info).toHaveProperty('isIOS');
      expect(info).toHaveProperty('isAndroid');
      expect(info).toHaveProperty('isSafari');
      expect(info).toHaveProperty('safeArea');
      expect(info).toHaveProperty('scrollbarWidth');
      expect(info).toHaveProperty('isStandalone');
      expect(info).toHaveProperty('isKeyboardVisible');
      expect(info).toHaveProperty('keyboardHeight');

      vp.destroy();
    });
  });

  describe('refresh()', () => {
    it('should re-measure viewport', () => {
      const vp = new viewportify.Viewportify();
      const initialInfo = vp.info;

      // Change window size
      (window as any).innerWidth = 800;
      (window as any).innerHeight = 600;

      const refreshedInfo = vp.refresh();
      expect(refreshedInfo.width).toBe(800);

      vp.destroy();
    });
  });

  describe('subscribe()', () => {
    it('should add a listener', () => {
      const vp = new viewportify.Viewportify();
      const callback = vi.fn();

      const unsubscribe = vp.subscribe(callback);
      expect(typeof unsubscribe).toBe('function');

      vp.destroy();
    });

    it('should return unsubscribe function', () => {
      const vp = new viewportify.Viewportify();
      const callback = vi.fn();

      const unsubscribe = vp.subscribe(callback);
      unsubscribe();

      // Should not throw
      vp.destroy();
    });
  });

  describe('destroy()', () => {
    it('should clean up listeners', () => {
      const vp = new viewportify.Viewportify();
      const callback = vi.fn();
      vp.subscribe(callback);

      vp.destroy();

      // Should not throw after destroy
      expect(true).toBe(true);
    });
  });
});

describe('Breakpoints', () => {
  let vp: InstanceType<typeof viewportify.Viewportify>;

  beforeEach(async () => {
    resetWindowMocks();
    vi.resetModules();
    viewportify = await import('../index');
    vp = new viewportify.Viewportify();
  });

  afterEach(() => {
    vp.destroy();
    vi.clearAllMocks();
  });

  describe('matchesBreakpoint()', () => {
    it('should match xs breakpoint', () => {
      (window as any).innerWidth = 320;
      vp.refresh();
      expect(vp.matchesBreakpoint('xs')).toBe(true);
    });

    it('should match sm breakpoint at 640px', () => {
      (window as any).innerWidth = 640;
      vp.refresh();
      expect(vp.matchesBreakpoint('sm')).toBe(true);
    });

    it('should match md breakpoint at 768px', () => {
      (window as any).innerWidth = 768;
      vp.refresh();
      expect(vp.matchesBreakpoint('md')).toBe(true);
    });

    it('should match lg breakpoint at 1024px', () => {
      (window as any).innerWidth = 1024;
      vp.refresh();
      expect(vp.matchesBreakpoint('lg')).toBe(true);
    });

    it('should match xl breakpoint at 1280px', () => {
      (window as any).innerWidth = 1280;
      vp.refresh();
      expect(vp.matchesBreakpoint('xl')).toBe(true);
    });

    it('should match 2xl breakpoint at 1536px', () => {
      (window as any).innerWidth = 1536;
      vp.refresh();
      expect(vp.matchesBreakpoint('2xl')).toBe(true);
    });

    it('should return false for undefined breakpoint', () => {
      expect(vp.matchesBreakpoint('nonexistent')).toBe(false);
    });
  });

  describe('getCurrentBreakpoint()', () => {
    it('should return xs for small screens', () => {
      (window as any).innerWidth = 320;
      vp.refresh();
      expect(vp.getCurrentBreakpoint()).toBe('xs');
    });

    it('should return sm for 640px', () => {
      (window as any).innerWidth = 640;
      vp.refresh();
      expect(vp.getCurrentBreakpoint()).toBe('sm');
    });

    it('should return md for 768px', () => {
      (window as any).innerWidth = 768;
      vp.refresh();
      expect(vp.getCurrentBreakpoint()).toBe('md');
    });

    it('should return lg for 1024px', () => {
      (window as any).innerWidth = 1024;
      vp.refresh();
      expect(vp.getCurrentBreakpoint()).toBe('lg');
    });

    it('should return xl for 1280px', () => {
      (window as any).innerWidth = 1280;
      vp.refresh();
      expect(vp.getCurrentBreakpoint()).toBe('xl');
    });

    it('should return 2xl for 1536px+', () => {
      (window as any).innerWidth = 1920;
      vp.refresh();
      expect(vp.getCurrentBreakpoint()).toBe('2xl');
    });
  });

  describe('isBelow()', () => {
    it('should return true when below breakpoint', () => {
      (window as any).innerWidth = 600;
      vp.refresh();
      expect(vp.isBelow('md')).toBe(true);
    });

    it('should return false when at or above breakpoint', () => {
      (window as any).innerWidth = 768;
      vp.refresh();
      expect(vp.isBelow('md')).toBe(false);
    });
  });

  describe('isAbove()', () => {
    it('should return true when at or above breakpoint', () => {
      (window as any).innerWidth = 1024;
      vp.refresh();
      expect(vp.isAbove('lg')).toBe(true);
    });

    it('should return false when below breakpoint', () => {
      (window as any).innerWidth = 600;
      vp.refresh();
      expect(vp.isAbove('lg')).toBe(false);
    });
  });

  describe('isBetween()', () => {
    it('should return true when between breakpoints', () => {
      (window as any).innerWidth = 900;
      vp.refresh();
      expect(vp.isBetween('md', 'lg')).toBe(true);
    });

    it('should return false when outside range', () => {
      (window as any).innerWidth = 1200;
      vp.refresh();
      expect(vp.isBetween('md', 'lg')).toBe(false);
    });
  });
});

describe('matchMedia()', () => {
  let vp: InstanceType<typeof viewportify.Viewportify>;

  beforeEach(async () => {
    resetWindowMocks();
    vi.resetModules();
    viewportify = await import('../index');
    vp = new viewportify.Viewportify();
  });

  afterEach(() => {
    vp.destroy();
    vi.clearAllMocks();
  });

  it('should return MediaQueryState object', () => {
    const state = vp.matchMedia('(min-width: 768px)');
    expect(state).toHaveProperty('matches');
    expect(state).toHaveProperty('query');
    expect(state).toHaveProperty('subscribe');
  });

  it('should have correct query string', () => {
    const state = vp.matchMedia('(min-width: 768px)');
    expect(state.query).toBe('(min-width: 768px)');
  });

  it('should provide subscribe function', () => {
    const state = vp.matchMedia('(min-width: 768px)');
    expect(typeof state.subscribe).toBe('function');

    const callback = vi.fn();
    const unsubscribe = state.subscribe(callback);
    expect(typeof unsubscribe).toBe('function');
  });
});

describe('Singleton Functions', () => {
  beforeEach(async () => {
    resetWindowMocks();
    vi.resetModules();
    viewportify = await import('../index');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initViewportify()', () => {
    it('should create and return singleton instance', () => {
      const instance1 = viewportify.initViewportify();
      const instance2 = viewportify.initViewportify();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getViewportify()', () => {
    it('should return singleton instance', () => {
      const instance = viewportify.getViewportify();
      expect(instance).toBeInstanceOf(viewportify.Viewportify);
    });
  });

  describe('getViewport()', () => {
    it('should return ViewportInfo', () => {
      const info = viewportify.getViewport();
      expect(info).toHaveProperty('width');
      expect(info).toHaveProperty('height');
    });
  });

  describe('Convenience getters', () => {
    it('getWidth() should return viewport width', () => {
      expect(viewportify.getWidth()).toBe(1024);
    });

    it('getHeight() should return viewport height', () => {
      expect(typeof viewportify.getHeight()).toBe('number');
    });

    it('getInnerWidth() should return window.innerWidth', () => {
      expect(viewportify.getInnerWidth()).toBe(1024);
    });

    it('getInnerHeight() should return window.innerHeight', () => {
      expect(viewportify.getInnerHeight()).toBe(768);
    });

    it('get100vh() should return height', () => {
      expect(typeof viewportify.get100vh()).toBe('number');
    });

    it('getDPR() should return device pixel ratio', () => {
      expect(viewportify.getDPR()).toBe(1);
    });
  });

  describe('Device detection functions', () => {
    it('isMobile() should return boolean', () => {
      expect(typeof viewportify.isMobile()).toBe('boolean');
    });

    it('isTablet() should return boolean', () => {
      expect(typeof viewportify.isTablet()).toBe('boolean');
    });

    it('isDesktop() should return boolean', () => {
      expect(typeof viewportify.isDesktop()).toBe('boolean');
    });

    it('isIOS() should return boolean', () => {
      expect(typeof viewportify.isIOS()).toBe('boolean');
    });

    it('isAndroid() should return boolean', () => {
      expect(typeof viewportify.isAndroid()).toBe('boolean');
    });

    it('isSafari() should return boolean', () => {
      expect(typeof viewportify.isSafari()).toBe('boolean');
    });

    it('isTouch() should return boolean', () => {
      expect(typeof viewportify.isTouch()).toBe('boolean');
    });

    it('isStandalone() should return boolean', () => {
      expect(typeof viewportify.isStandalone()).toBe('boolean');
    });
  });

  describe('Other utility functions', () => {
    it('getOrientation() should return portrait or landscape', () => {
      const orientation = viewportify.getOrientation();
      expect(['portrait', 'landscape']).toContain(orientation);
    });

    it('isKeyboardVisible() should return boolean', () => {
      expect(typeof viewportify.isKeyboardVisible()).toBe('boolean');
    });

    it('getKeyboardHeight() should return number', () => {
      expect(typeof viewportify.getKeyboardHeight()).toBe('number');
    });

    it('getSafeArea() should return SafeAreaInsets', () => {
      const safeArea = viewportify.getSafeArea();
      expect(safeArea).toHaveProperty('top');
      expect(safeArea).toHaveProperty('right');
      expect(safeArea).toHaveProperty('bottom');
      expect(safeArea).toHaveProperty('left');
    });

    it('getScrollbarWidth() should return number', () => {
      expect(typeof viewportify.getScrollbarWidth()).toBe('number');
    });

    it('getCurrentBreakpoint() should return breakpoint name', () => {
      const bp = viewportify.getCurrentBreakpoint();
      expect(typeof bp).toBe('string');
    });

    it('matchesBreakpoint() should return boolean', () => {
      expect(typeof viewportify.matchesBreakpoint('md')).toBe('boolean');
    });
  });

  describe('onViewportChange()', () => {
    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = viewportify.onViewportChange(callback);
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });
});

describe('CSS Variables', () => {
  beforeEach(async () => {
    resetWindowMocks();
    vi.resetModules();
    viewportify = await import('../index');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should set CSS variables when setCSSVariables is true', () => {
    const vp = new viewportify.Viewportify({ setCSSVariables: true });

    const root = document.documentElement;
    const vpWidth = root.style.getPropertyValue('--vp-width');

    // CSS variable should be set
    expect(vpWidth).toBeTruthy();
    vp.destroy();
  });

  it('should use custom prefix', () => {
    const vp = new viewportify.Viewportify({
      setCSSVariables: true,
      cssPrefix: '--custom',
    });

    const root = document.documentElement;
    const customWidth = root.style.getPropertyValue('--custom-width');

    expect(customWidth).toBeTruthy();
    vp.destroy();
  });

  it('should not set CSS variables when setCSSVariables is false', () => {
    // Clear any existing variables
    document.documentElement.style.removeProperty('--test-width');

    const vp = new viewportify.Viewportify({
      setCSSVariables: false,
      cssPrefix: '--test',
    });

    const root = document.documentElement;
    const testWidth = root.style.getPropertyValue('--test-width');

    expect(testWidth).toBe('');
    vp.destroy();
  });
});

describe('Element Size Utilities', () => {
  beforeEach(async () => {
    resetWindowMocks();
    vi.resetModules();
    viewportify = await import('../index');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getElementSize()', () => {
    it('should return ElementSize object for valid element', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      const size = viewportify.getElementSize(div);

      expect(size).toHaveProperty('width');
      expect(size).toHaveProperty('height');
      expect(size).toHaveProperty('top');
      expect(size).toHaveProperty('left');
      expect(size).toHaveProperty('right');
      expect(size).toHaveProperty('bottom');
      expect(size).toHaveProperty('x');
      expect(size).toHaveProperty('y');

      document.body.removeChild(div);
    });

    it('should return zeros for null element', () => {
      const size = viewportify.getElementSize(null);

      expect(size.width).toBe(0);
      expect(size.height).toBe(0);
    });
  });

  describe('observeElementSize()', () => {
    it('should return observer object', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      const callback = vi.fn();
      const observer = viewportify.observeElementSize(div, callback);

      expect(observer).toHaveProperty('disconnect');
      expect(observer).toHaveProperty('getSize');
      expect(typeof observer.disconnect).toBe('function');
      expect(typeof observer.getSize).toBe('function');

      observer.disconnect();
      document.body.removeChild(div);
    });

    it('should call callback with initial size', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      const callback = vi.fn();
      const observer = viewportify.observeElementSize(div, callback);

      expect(callback).toHaveBeenCalledTimes(1);

      observer.disconnect();
      document.body.removeChild(div);
    });

    it('should handle null element gracefully', () => {
      const callback = vi.fn();
      const observer = viewportify.observeElementSize(null, callback);

      expect(observer.disconnect).toBeDefined();
      expect(observer.getSize()).toEqual({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
      });
    });
  });

  describe('onWindowResize()', () => {
    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = viewportify.onWindowResize(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should call callback immediately by default', () => {
      const callback = vi.fn();
      const unsubscribe = viewportify.onWindowResize(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ width: 1024, height: 768 });

      unsubscribe();
    });

    it('should not call callback immediately when immediate is false', () => {
      const callback = vi.fn();
      const unsubscribe = viewportify.onWindowResize(callback, { immediate: false });

      expect(callback).not.toHaveBeenCalled();

      unsubscribe();
    });
  });
});
