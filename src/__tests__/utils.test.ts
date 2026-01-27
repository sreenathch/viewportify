import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  resetWindowMocks,
  mockIOSDevice,
  mockAndroidDevice,
  mockSafariBrowser,
  mockMobileViewport,
  mockTabletViewport,
} from './setup';

// We need to import the module after mocking window
let viewportify: typeof import('../index');

describe('Utility Functions', () => {
  beforeEach(async () => {
    resetWindowMocks();
    // Reset module cache to get fresh imports
    vi.resetModules();
    viewportify = await import('../index');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isBrowser detection', () => {
    it('should detect browser environment', () => {
      // In jsdom, we're in a browser-like environment
      expect(typeof window).toBe('object');
      expect(typeof document).toBe('object');
    });
  });

  describe('Device Detection', () => {
    describe('iOS Detection', () => {
      it('should detect iPhone', async () => {
        mockIOSDevice();
        vi.resetModules();
        const mod = await import('../index');
        const vp = new mod.Viewportify();
        expect(vp.info.isIOS).toBe(true);
        vp.destroy();
      });

      it('should not detect iOS on desktop', async () => {
        resetWindowMocks();
        vi.resetModules();
        const mod = await import('../index');
        const vp = new mod.Viewportify();
        expect(vp.info.isIOS).toBe(false);
        vp.destroy();
      });
    });

    describe('Android Detection', () => {
      it('should detect Android device', async () => {
        mockAndroidDevice();
        vi.resetModules();
        const mod = await import('../index');
        const vp = new mod.Viewportify();
        expect(vp.info.isAndroid).toBe(true);
        vp.destroy();
      });

      it('should not detect Android on desktop', async () => {
        resetWindowMocks();
        vi.resetModules();
        const mod = await import('../index');
        const vp = new mod.Viewportify();
        expect(vp.info.isAndroid).toBe(false);
        vp.destroy();
      });
    });

    describe('Safari Detection', () => {
      it('should detect Safari browser', async () => {
        mockSafariBrowser();
        vi.resetModules();
        const mod = await import('../index');
        const vp = new mod.Viewportify();
        expect(vp.info.isSafari).toBe(true);
        vp.destroy();
      });

      it('should not detect Safari on Chrome', async () => {
        resetWindowMocks();
        vi.resetModules();
        const mod = await import('../index');
        const vp = new mod.Viewportify();
        expect(vp.info.isSafari).toBe(false);
        vp.destroy();
      });
    });

    describe('Touch Detection', () => {
      it('should detect touch capability', async () => {
        (window as any).navigator = {
          ...window.navigator,
          maxTouchPoints: 5,
        };
        vi.resetModules();
        const mod = await import('../index');
        const vp = new mod.Viewportify();
        expect(vp.info.isTouch).toBe(true);
        vp.destroy();
      });

      it('should not detect touch on non-touch device', async () => {
        resetWindowMocks();
        vi.resetModules();
        const mod = await import('../index');
        const vp = new mod.Viewportify();
        expect(vp.info.isTouch).toBe(false);
        vp.destroy();
      });
    });
  });

  describe('Device Type Detection', () => {
    it('should detect mobile device by viewport width', async () => {
      mockMobileViewport();
      vi.resetModules();
      const mod = await import('../index');
      const vp = new mod.Viewportify();
      expect(vp.info.isMobile).toBe(true);
      expect(vp.info.isTablet).toBe(false);
      expect(vp.info.isDesktop).toBe(false);
      vp.destroy();
    });

    it('should detect tablet device', async () => {
      mockTabletViewport();
      vi.resetModules();
      const mod = await import('../index');
      const vp = new mod.Viewportify();
      expect(vp.info.isMobile).toBe(false);
      expect(vp.info.isTablet).toBe(true);
      expect(vp.info.isDesktop).toBe(false);
      vp.destroy();
    });

    it('should detect desktop device', async () => {
      resetWindowMocks(); // 1024x768 is desktop
      vi.resetModules();
      const mod = await import('../index');
      const vp = new mod.Viewportify();
      expect(vp.info.isMobile).toBe(false);
      expect(vp.info.isTablet).toBe(false);
      expect(vp.info.isDesktop).toBe(true);
      vp.destroy();
    });
  });

  describe('Orientation Detection', () => {
    it('should detect landscape orientation', async () => {
      (window as any).innerWidth = 1024;
      (window as any).innerHeight = 768;
      vi.resetModules();
      const mod = await import('../index');
      const vp = new mod.Viewportify();
      expect(vp.info.orientation).toBe('landscape');
      vp.destroy();
    });

    it('should detect portrait orientation', async () => {
      (window as any).innerWidth = 768;
      (window as any).innerHeight = 1024;
      vi.resetModules();
      const mod = await import('../index');
      const vp = new mod.Viewportify();
      expect(vp.info.orientation).toBe('portrait');
      vp.destroy();
    });
  });
});

describe('Viewport Measurements', () => {
  beforeEach(async () => {
    resetWindowMocks();
    vi.resetModules();
    viewportify = await import('../index');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should measure viewport width', () => {
    const vp = new viewportify.Viewportify();
    expect(vp.info.width).toBe(1024);
    vp.destroy();
  });

  it('should measure viewport height', () => {
    const vp = new viewportify.Viewportify();
    // Height might differ due to iOS vh fix, but should be a number
    expect(typeof vp.info.height).toBe('number');
    expect(vp.info.height).toBeGreaterThan(0);
    vp.destroy();
  });

  it('should calculate vh unit', () => {
    const vp = new viewportify.Viewportify();
    // vh = height / 100
    expect(vp.info.vh).toBeCloseTo(vp.info.height / 100, 2);
    vp.destroy();
  });

  it('should calculate vw unit', () => {
    const vp = new viewportify.Viewportify();
    expect(vp.info.vw).toBe(10.24); // 1024 / 100
    vp.destroy();
  });

  it('should calculate vmin', () => {
    (window as any).innerWidth = 800;
    (window as any).innerHeight = 600;
    const vp = new viewportify.Viewportify();
    expect(vp.info.vmin).toBeCloseTo(Math.min(800, vp.info.height) / 100, 2);
    vp.destroy();
  });

  it('should calculate vmax', () => {
    (window as any).innerWidth = 800;
    (window as any).innerHeight = 600;
    const vp = new viewportify.Viewportify();
    expect(vp.info.vmax).toBeCloseTo(Math.max(800, vp.info.height) / 100, 2);
    vp.destroy();
  });

  it('should report screen dimensions', () => {
    const vp = new viewportify.Viewportify();
    expect(vp.info.screenWidth).toBe(1920);
    expect(vp.info.screenHeight).toBe(1080);
    vp.destroy();
  });

  it('should report device pixel ratio', () => {
    const vp = new viewportify.Viewportify();
    expect(vp.info.dpr).toBe(1);
    vp.destroy();
  });
});

describe('Safe Area Insets', () => {
  beforeEach(async () => {
    resetWindowMocks();
    vi.resetModules();
    viewportify = await import('../index');
  });

  it('should return safe area insets object', () => {
    const vp = new viewportify.Viewportify();
    expect(vp.info.safeArea).toHaveProperty('top');
    expect(vp.info.safeArea).toHaveProperty('right');
    expect(vp.info.safeArea).toHaveProperty('bottom');
    expect(vp.info.safeArea).toHaveProperty('left');
    vp.destroy();
  });

  it('should return numeric values for safe area', () => {
    const vp = new viewportify.Viewportify();
    expect(typeof vp.info.safeArea.top).toBe('number');
    expect(typeof vp.info.safeArea.right).toBe('number');
    expect(typeof vp.info.safeArea.bottom).toBe('number');
    expect(typeof vp.info.safeArea.left).toBe('number');
    vp.destroy();
  });
});
