import * as pointer from '../../src/pointer.js';
import { getCanvas } from '../../src/core.js';
import { emit, on } from '../../src/events.js';
import { noop } from '../../src/utils.js';
import { simulateEvent } from '../utils.js';

// Enhanced event simulation for mouse and touch events
function simulatePointerEvent(type, config = {}, element = window) {
  let event;
  
  if (type.startsWith('mouse')) {
    event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: config.clientX || 0,
      clientY: config.clientY || 0,
      button: config.button || 0,
      ...config
    });
  } else if (type.startsWith('touch')) {
    // For touch events, we need to create TouchEvent with touches
    const touchInit = {
      bubbles: true,
      cancelable: true,
      touches: config.touches || [],
      changedTouches: config.changedTouches || [],
      targetTouches: config.targetTouches || config.touches || [],
      ...config
    };
    event = new TouchEvent(type, touchInit);
  } else {
    // Fall back to basic Event for other types like 'blur'
    event = new Event(type, { bubbles: true, cancelable: true });
    // Copy additional properties
    for (let prop in config) {
      if (!(prop in event)) {
        event[prop] = config[prop];
      }
    }
  }
  
  element.dispatchEvent(event);
  return event;
}

// Mock getBoundingClientRect and getComputedStyle for canvas elements in jsdom
function mockCanvasRect(canvas) {
  // Store original getComputedStyle if it exists
  const originalGetComputedStyle = window.getComputedStyle;
  
  // Helper to convert CSS transform to matrix format like browsers do
  function convertTransformToMatrix(transform) {
    if (!transform || transform === 'none') {
      return 'none';
    }
    
    // Convert scale(x, y) to matrix format
    if (transform.includes('scale')) {
      const match = transform.match(/scale\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(',').map(v => parseFloat(v.trim()));
        const scaleX = values[0] || 1;
        const scaleY = values[1] || scaleX;
        return `matrix(${scaleX}, 0, 0, ${scaleY}, 0, 0)`;
      }
    }
    
    // If already in matrix format or other format, return as-is
    return transform;
  }
  
  // Helper function to mock a canvas element
  function setupCanvasMock(canvasElement) {
    // Mock getBoundingClientRect to account for canvas dimensions and styles
    canvasElement.getBoundingClientRect = jest.fn(() => {
      const style = canvasElement.style;
      
      // Parse border values - support both shorthand and individual properties
      const parseBorder = (prop) => {
        if (style[prop]) return parseFloat(style[prop]);
        if (style.border) {
          const match = style.border.match(/(\d+)px/);
          return match ? parseFloat(match[1]) : 0;
        }
        return 0;
      };
      
      // Parse padding values - support both shorthand and individual properties
      const parsePadding = (prop) => {
        if (style[prop]) return parseFloat(style[prop]);
        if (style.padding) {
          const match = style.padding.match(/(\d+)px/);
          return match ? parseFloat(match[1]) : 0;
        }
        return 0;
      };
      
      const borderLeft = parseBorder('borderLeftWidth');
      const borderTop = parseBorder('borderTopWidth');
      const borderRight = parseBorder('borderRightWidth');
      const borderBottom = parseBorder('borderBottomWidth');
      
      const paddingLeft = parsePadding('paddingLeft');
      const paddingTop = parsePadding('paddingTop');
      const paddingRight = parsePadding('paddingRight');
      const paddingBottom = parsePadding('paddingBottom');
      
      // Calculate scale from transform
      let scaleX = 1, scaleY = 1;
      if (style.transform && style.transform.includes('scale')) {
        const match = style.transform.match(/scale\(([^)]+)\)/);
        if (match) {
          const values = match[1].split(',').map(v => parseFloat(v.trim()));
          scaleX = values[0] || 1;
          scaleY = values[1] || scaleX;
        }
      }
      
      // Get canvas dimensions, considering CSS width/height if set
      let rectWidth = canvasElement.width;
      let rectHeight = canvasElement.height;
      
      if (style.width) {
        rectWidth = parseFloat(style.width);
      }
      if (style.height) {
        rectHeight = parseFloat(style.height);
      } else if (style.width) {
        // If only width is set, maintain aspect ratio
        const widthScale = parseFloat(style.width) / canvasElement.width;
        rectHeight = canvasElement.height * widthScale;
      }
      
      // Apply scale transform and add borders/padding
      const totalBorderPaddingWidth = (borderLeft + borderRight + paddingLeft + paddingRight) * scaleX;
      const totalBorderPaddingHeight = (borderTop + borderBottom + paddingTop + paddingBottom) * scaleY;
      
      const finalWidth = rectWidth * scaleX + totalBorderPaddingWidth;
      const finalHeight = rectHeight * scaleY + totalBorderPaddingHeight;
      
      return {
        left: 0,
        top: 0,
        right: finalWidth,
        bottom: finalHeight,
        width: finalWidth,
        height: finalHeight,
        x: 0,
        y: 0
      };
    });
  }
  
  // Mock the initial canvas
  setupCanvasMock(canvas);
  
  // Override document.createElement to auto-mock new canvas elements
  const originalCreateElement = document.createElement;
  document.createElement = jest.fn((tagName) => {
    const element = originalCreateElement.call(document, tagName);
    if (tagName.toLowerCase() === 'canvas') {
      setupCanvasMock(element);
    }
    return element;
  });
  
  // Mock getComputedStyle globally for all canvas elements
  window.getComputedStyle = jest.fn((element) => {
    if (element && element.tagName && element.tagName.toLowerCase() === 'canvas') {
      // Helper to parse style values including border shorthand
      const getBorderWidth = (side) => {
        const sideMap = {
          'border-left-width': 'borderLeftWidth',
          'border-right-width': 'borderRightWidth', 
          'border-top-width': 'borderTopWidth',
          'border-bottom-width': 'borderBottomWidth'
        };
        
        const styleProp = sideMap[side];
        if (element.style[styleProp]) {
          return element.style[styleProp];
        }
        
        if (element.style.border) {
          const match = element.style.border.match(/(\d+)px/);
          return match ? match[1] + 'px' : '0px';
        }
        
        return '0px';
      };
      
      // Helper to parse padding values including padding shorthand
      const getPaddingWidth = (side) => {
        const sideMap = {
          'padding-left': 'paddingLeft',
          'padding-right': 'paddingRight',
          'padding-top': 'paddingTop', 
          'padding-bottom': 'paddingBottom'
        };
        
        const styleProp = sideMap[side];
        if (element.style[styleProp]) {
          return element.style[styleProp];
        }
        
        if (element.style.padding) {
          const match = element.style.padding.match(/(\d+)px/);
          return match ? match[1] + 'px' : '0px';
        }
        
        return '0px';
      };
      
      return {
        transform: convertTransformToMatrix(element.style.transform),
        width: element.style.width || element.width + 'px',
        height: element.style.height || element.height + 'px',
        getPropertyValue: function(prop) {
          const propMap = {
            'border-left-width': getBorderWidth('border-left-width'),
            'border-right-width': getBorderWidth('border-right-width'),
            'border-top-width': getBorderWidth('border-top-width'),
            'border-bottom-width': getBorderWidth('border-bottom-width'),
            'padding-left': getPaddingWidth('padding-left'),
            'padding-right': getPaddingWidth('padding-right'),
            'padding-top': getPaddingWidth('padding-top'),
            'padding-bottom': getPaddingWidth('padding-bottom'),
            'transform': this.transform,
            'width': this.width,
            'height': this.height
          };
          return propMap[prop] || '0px';
        }
      };
    }
    // Fall back to original implementation for non-canvas elements
    return originalGetComputedStyle ? originalGetComputedStyle.call(this, element) : {};
  });
}

// --------------------------------------------------
// pointer
// --------------------------------------------------
describe('pointer', () => {
  let object, canvas;

  // reset pressed buttons before each test
  beforeEach(() => {
    // reset canvas offsets
    canvas = getCanvas();
    canvas.width = canvas.height = 600;
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    
    // Mock getBoundingClientRect for jsdom
    mockCanvasRect(canvas);

    pointer.initPointer();

    simulatePointerEvent('blur', {}, canvas);

    object = {
      x: 100,
      y: 50,
      width: 10,
      height: 20,
      render: jest.fn()
    };
  });

  afterEach(() => {
    pointer.resetPointers();
  });

  it('should export api', () => {
    expect(pointer.pointerMap).toEqual({
      0: 'left',
      1: 'middle',
      2: 'right'
    });

    expect(pointer.getPointer).toEqual(expect.any(Function));
    expect(pointer.initPointer).toEqual(expect.any(Function));
    expect(pointer.track).toEqual(expect.any(Function));
    expect(pointer.untrack).toEqual(expect.any(Function));
    expect(pointer.pointerOver).toEqual(expect.any(Function));
    expect(pointer.onPointer).toEqual(expect.any(Function));
    expect(pointer.offPointer).toEqual(expect.any(Function));
    expect(pointer.pointerPressed).toEqual(expect.any(Function));
  });

  // --------------------------------------------------
  // initPointer
  // --------------------------------------------------
  describe('initPointer', () => {
    it('should add event listeners', () => {
      const spy = jest.spyOn(getCanvas(), 'addEventListener');

      pointer.initPointer();

      expect(spy).toHaveBeenCalled();
      
      spy.mockRestore();
    });

    it('should return the pointer object', () => {
      const pntr = pointer.initPointer();

      expect(pntr.x).toBeDefined();
      expect(pntr.y).toBeDefined();
      expect(pntr.radius).toBeDefined();
    });

    it('should allow multiple canvases', () => {
      let pntr = pointer.initPointer();

      let canvas = document.createElement('canvas');
      let otherPntr = pointer.initPointer({ canvas });

      expect(pntr).not.toBe(otherPntr);
      expect(otherPntr.canvas).toBe(canvas);
    });

    it('should update radius', () => {
      let pntr = pointer.initPointer();
      let canvas = document.createElement('canvas');
      let otherPntr = pointer.initPointer({ canvas, radius: 10 });

      expect(pntr.radius).not.toBe(otherPntr.radius);
      expect(otherPntr.radius).toBe(10);
    });
  });

  // --------------------------------------------------
  // pointerPressed
  // --------------------------------------------------
  describe('pointerPressed', () => {
    it('should return false when a button is not pressed', () => {
      expect(pointer.pointerPressed('left')).toBe(false);
      expect(pointer.pointerPressed('middle')).toBe(false);
      expect(pointer.pointerPressed('right')).toBe(false);
    });

    it('should return true for a button', () => {
      simulatePointerEvent('mousedown', { button: 1 }, canvas);

      expect(pointer.pointerPressed('middle')).toBe(true);
    });

    it('should return false if the button is no longer pressed', () => {
      simulatePointerEvent('mousedown', { button: 2 }, canvas);
      simulatePointerEvent('mouseup', { button: 2 }, canvas);

      expect(pointer.pointerPressed('right')).toBe(false);
    });

    it('should return true for touchstart', () => {
      simulatePointerEvent(
        'touchstart',
        {
          touches: [{ identifier: 0, clientX: 100, clientY: 50 }],
          changedTouches: [
            { identifier: 0, clientX: 100, clientY: 50 }
          ]
        },
        canvas
      );

      expect(pointer.pointerPressed('left')).toBe(true);
    });

    it('should return false for a touchend', () => {
      simulatePointerEvent(
        'touchstart',
        {
          touches: [{ identifier: 0, clientX: 100, clientY: 50 }],
          changedTouches: [
            { identifier: 0, clientX: 100, clientY: 50 }
          ]
        },
        canvas
      );
      simulatePointerEvent(
        'touchend',
        {
          touches: [{ identifier: 0, clientX: 100, clientY: 50 }],
          changedTouches: [
            { identifier: 0, clientX: 100, clientY: 50 }
          ]
        },
        canvas
      );

      expect(pointer.pointerPressed('left')).toBe(false);
    });
  });

  // --------------------------------------------------
  // track
  // --------------------------------------------------
  describe('track', () => {
    it('should override the objects render function to track render order', () => {
      let obj = { render: noop };
      pointer.track(obj);

      expect(obj.render).not.toBe(noop);
      expect(obj.__r).toBeDefined();
    });

    it('should take multiple objects', () => {
      let obj = { render: noop };
      let obj2 = { render: noop };
      pointer.track(obj, obj2);

      expect(obj.render).not.toBe(noop);
      expect(obj.__r).toBeDefined();
      expect(obj2.render).not.toBe(noop);
      expect(obj2.__r).toBeDefined();
    });

    it('should take an array of objects', () => {
      let obj = { render: noop };
      let obj2 = { render: noop };
      pointer.track([obj, obj2]);

      expect(obj.render).not.toBe(noop);
      expect(obj.__r).toBeDefined();
      expect(obj2.render).not.toBe(noop);
      expect(obj2.__r).toBeDefined();
    });

    it('should call the objects original render function', () => {
      let render = jest.fn();
      let obj = { render };
      pointer.track(obj);
      obj.render();

      expect(render).toHaveBeenCalled();
    });

    it('should do nothing if the object is already tracked', () => {
      let obj = { render: noop };
      let render;

      function func() {
        pointer.track(obj);

        render = obj.__r;

        pointer.track(obj);
      }

      expect(func).not.toThrow();
      expect(render).toBe(obj.__r);
    });

    it('should track objects separately for each canvas', () => {
      let canvas = document.createElement('canvas');
      pointer.initPointer({ canvas });

      let obj1 = { render: noop };
      let obj2 = { context: { canvas } };

      pointer.track(obj1, obj2);

      let pntr1 = pointer.getPointer();
      let pntr2 = pointer.getPointer(canvas);

      expect(pntr1._o.includes(obj1)).toBe(true);
      expect(pntr1._o.includes(obj2)).toBe(false);
      expect(pntr2._o.includes(obj1)).toBe(false);
      expect(pntr2._o.includes(obj2)).toBe(true);
    });

    it('should throw error if pointer events are not setup', () => {
      function func() {
        let canvas = document.createElement('canvas');
        pointer.track({ context: { canvas } });
      }

      expect(func).toThrow();
    });
  });

  // --------------------------------------------------
  // untrack
  // --------------------------------------------------
  describe('untrack', () => {
    it('should restore the objects original render function', () => {
      let obj = { render: noop };
      pointer.track(obj);
      pointer.untrack(obj);

      expect(obj.render).toBe(noop);
      expect(obj.__r).not.toBe(true);
    });

    it('should take multiple objects', () => {
      let obj = { render: noop };
      let obj2 = { render: noop };
      pointer.track(obj, obj2);
      pointer.untrack(obj, obj2);

      expect(obj.render).toBe(noop);
      expect(obj.__r).not.toBe(true);
      expect(obj2.render).toBe(noop);
      expect(obj2.__r).not.toBe(true);
    });

    it('should take an array objects', () => {
      let obj = { render: noop };
      let obj2 = { render: noop };
      pointer.track(obj, obj2);
      pointer.untrack([obj, obj2]);

      expect(obj.render).toBe(noop);
      expect(obj.__r).not.toBe(true);
      expect(obj2.render).toBe(noop);
      expect(obj2.__r).not.toBe(true);
    });

    it('should do nothing if the object was never tracked', () => {
      function func() {
        pointer.untrack({ foo: 1 });
      }

      expect(func).not.toThrow();
    });

    it('should untrack objects separately for each canvas', () => {
      let canvas = document.createElement('canvas');
      pointer.initPointer({ canvas });

      let obj1 = { render: noop };
      let obj2 = { context: { canvas } };

      pointer.track(obj1, obj2);
      pointer.untrack(obj1, obj2);

      let pntr1 = pointer.getPointer();
      let pntr2 = pointer.getPointer(canvas);

      expect(pntr1._o.includes(obj1)).toBe(false);
      expect(pntr1._o.includes(obj2)).toBe(false);
      expect(pntr2._o.includes(obj1)).toBe(false);
      expect(pntr2._o.includes(obj2)).toBe(false);
    });

    it('should throw error if pointer events are not setup', () => {
      function func() {
        let canvas = document.createElement('canvas');
        pointer.untrack({ context: { canvas } });
      }

      expect(func).toThrow();
    });
  });

  describe('events', () => {
    let pntr;
    beforeEach(() => {
      pointer.track(object);
      object.render();
      emit('tick');
      pntr = pointer.getPointer();
    });

    // --------------------------------------------------
    // pointerOver
    // --------------------------------------------------
    describe('pointerOver', () => {
      it('should return false is object is not being tracked', () => {
        expect(pointer.pointerOver({})).toBe(false);
      });

      it('should return false if the pointer is not over the object', () => {
        pntr.x = 50;
        pntr.y = 55;

        expect(pointer.pointerOver(object)).toBe(false);
      });

      it('should return true if the pointer is over the object', () => {
        pntr.x = 105;
        pntr.y = 55;

        expect(pointer.pointerOver(object)).toBe(true);
      });

      it('should handle objects from different canvas', () => {
        let canvas = document.createElement('canvas');
        let pntr2 = pointer.initPointer({ canvas });

        let obj = {
          x: 100,
          y: 50,
          width: 10,
          height: 20,
          render: noop,
          context: { canvas }
        };
        pointer.track(obj);
        obj.render();
        emit('tick');

        pntr2.x = 105;
        pntr2.y = 55;

        expect(pointer.pointerOver(obj)).toBe(true);
      });

      it('should throw error if pointer events are not setup', () => {
        function func() {
          let canvas = document.createElement('canvas');
          pointer.pointerOver({ context: { canvas } });
        }

        expect(func).toThrow();
      });
    });

    // --------------------------------------------------
    // getCurrentObject
    // --------------------------------------------------
    describe('getCurrentObject', () => {
      it('should correctly return the object under the pointer', () => {
        let obj = {
          x: 110,
          y: 50,
          width: 10,
          height: 20,
          render: jest.fn()
        };
        pointer.track(obj);
        emit('tick');

        object.render();
        obj.render();
        emit('tick');

        pntr.x = 100;
        pntr.y = 50;

        expect(pointer.pointerOver(object)).toBe(true);

        pntr.x = 108;

        // object rendered first so obj is on top
        expect(pointer.pointerOver(obj)).toBe(true);
      });

      it('should take into account object anchor', () => {
        object.anchor = {
          x: 0.5,
          y: 0.5
        };

        pntr.x = 95;
        pntr.y = 55;

        expect(pointer.pointerOver(object)).toBe(true);
      });

      it('should take into account object camera', () => {
        object.sx = 5;
        object.sy = 10;

        pntr.x = 95;
        pntr.y = 55;

        expect(pointer.pointerOver(object)).toBe(true);
      });

      it('should take into account parent object camera', () => {
        let parent = {
          sx: 5,
          sy: 10
        };
        object.parent = parent;

        pntr.x = 95;
        pntr.y = 55;

        expect(pointer.pointerOver(object)).toBe(true);
      });

      it('should take into account all parent object camera', () => {
        let grandparent = {
          sx: 9,
          sy: 9
        };
        let parent = {
          sx: 1,
          sy: 1
        };
        object.parent = parent;
        parent.parent = grandparent;

        pntr.x = 90;
        pntr.y = 50;

        expect(pointer.pointerOver(object)).toBe(true);
      });

      it('should call the objects collidesWithPointer function', () => {
        object.collidesWithPointer = jest.fn();
        pointer.pointerOver(object);

        expect(object.collidesWithPointer).toHaveBeenCalled();
      });
    });

    // --------------------------------------------------
    // mousemove
    // --------------------------------------------------
    describe('mousemove', () => {
      it('should update the x and y pointer coordinates', () => {
        pntr.x = pntr.y = 0;
        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 100, clientY: 50 },
          canvas
        );

        expect(pntr.x).toBe(100);
        expect(pntr.y).toBe(50);
      });

      it('should take into account padding and border style', () => {
        pntr.x = pntr.y = 0;

        pointer.resetPointers();
        canvas.style.border = '32px solid';
        canvas.style.padding = '32px';
        pntr = pointer.initPointer({ canvas });

        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 100, clientY: 50 },
          canvas
        );

        expect(pntr.x).toBe(36);
        expect(pntr.y).toBe(-14);
      });

      it('should take into account transform: scale style', () => {
        pntr.x = pntr.y = 0;

        pointer.resetPointers();
        canvas.style.transform = 'scale(0.5)';
        canvas.style.transformOrigin = 'top left';
        pntr = pointer.initPointer({ canvas });

        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 50, clientY: 25 },
          canvas
        );

        expect(pntr.x).toBe(100);
        expect(pntr.y).toBe(50);
      });

      it('should take into account width style', () => {
        pntr.x = pntr.y = 0;

        pointer.resetPointers();
        canvas.style.width = canvas.width * 2 + 'px';
        pntr = pointer.initPointer({ canvas });

        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 100, clientY: 50 },
          canvas
        );

        expect(pntr.x).toBe(50);
        expect(pntr.y).toBe(25);
      });

      it('should take into account all style properties', () => {
        pntr.x = pntr.y = 0;

        pointer.resetPointers();
        canvas.style.border = '32px solid';
        canvas.style.padding = '32px';
        canvas.style.transform = 'scale(0.5)';
        canvas.style.transformOrigin = 'top left';
        canvas.style.width = canvas.width * 2 + 'px';
        pntr = pointer.initPointer({ canvas });

        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 100, clientY: 50 },
          canvas
        );

        expect(pntr.x).toBe(68);
        expect(pntr.y).toBe(18);
      });

      it('should call the objects onOver function if it is the target', () => {
        object.onOver = jest.fn();
        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 105, clientY: 55 },
          canvas
        );

        expect(object.onOver).toHaveBeenCalled();
      });

      it('should call the objects onOut function if it is no longer the target', () => {
        object.onOut = jest.fn();
        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 105, clientY: 55 },
          canvas
        );
        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 150, clientY: 55 },
          canvas
        );

        expect(object.onOut).toHaveBeenCalled();
      });

      it('should call the objects onOut function if another object is the target', () => {
        let obj = {
          x: 150,
          y: 50,
          width: 10,
          height: 20,
          render: jest.fn()
        };
        pointer.track(obj);
        object.render();
        obj.render();
        emit('tick');

        object.onOut = jest.fn();
        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 105, clientY: 55 },
          canvas
        );
        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 155, clientY: 55 },
          canvas
        );

        expect(pointer.pointerOver(obj)).toBe(true);
        expect(object.onOut).toHaveBeenCalled();
      });

      it('should take into account object anchor', () => {
        object.anchor = {
          x: 0.5,
          y: 0.5
        };
        object.onOver = jest.fn();
        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 110, clientY: 55 },
          canvas
        );

        expect(object.onOver).not.toHaveBeenCalled();

        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 95, clientY: 55 },
          canvas
        );

        expect(object.onOver).toHaveBeenCalled();
      });

      it('should handle objects from different canvas', () => {
        let otherCanvas = document.createElement('canvas');
        document.body.appendChild(otherCanvas);
        otherCanvas.width = otherCanvas.height = 600;
        otherCanvas.style.position = 'fixed';
        otherCanvas.style.top = 0;
        otherCanvas.style.left = 0;

        pointer.initPointer({ canvas: otherCanvas });

        let obj = {
          x: 100,
          y: 50,
          width: 10,
          height: 20,
          render: noop,
          onOver: jest.fn(),
          context: { canvas: otherCanvas }
        };
        pointer.track(obj);
        obj.render();
        emit('tick');

        // wrong canvas
        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 105, clientY: 55 },
          canvas
        );
        expect(obj.onOver).not.toHaveBeenCalled();

        simulatePointerEvent(
          'mousemove',
          { identifier: 0, clientX: 105, clientY: 55 },
          otherCanvas
        );
        expect(obj.onOver).toHaveBeenCalled();
      });
    });

    // --------------------------------------------------
    // mousedown, mouseup, touchstart, touchend
    // --------------------------------------------------
    ['mousedown', 'mouseup', 'touchstart', 'touchend'].forEach(
      eventName => {
        describe(eventName, () => {
          const event = { identifier: 0, clientX: 0, clientY: 0 };
          const config = eventName.startsWith('mouse')
            ? event
            : { touches: [event], changedTouches: [event] };
          const eventHandler =
            eventName === 'mousedown' || eventName === 'touchstart'
              ? 'onDown'
              : 'onUp';
          const pointerHandler =
            eventHandler === 'onDown' ? 'down' : 'up';

          it('should update the x and y pointer coordinates', () => {
            pntr.x = pntr.y = 0;
            event.clientX = 100;
            event.clientY = 50;
            simulatePointerEvent(eventName, config, canvas);

            expect(pntr.x).toBe(100);
            expect(pntr.y).toBe(50);
          });

          it('should take into account padding and border style', () => {
            pntr.x = pntr.y = 0;

            pointer.resetPointers();
            canvas.style.border = '32px solid';
            canvas.style.padding = '32px';
            pntr = pointer.initPointer({ canvas });

            event.clientX = 100;
            event.clientY = 50;
            simulatePointerEvent(eventName, config, canvas);

            expect(pntr.x).toBe(36);
            expect(pntr.y).toBe(-14);
          });

          it('should take into account transform: scale style', () => {
            pntr.x = pntr.y = 0;

            pointer.resetPointers();
            canvas.style.transform = 'scale(0.5)';
            canvas.style.transformOrigin = 'top left';
            pntr = pointer.initPointer({ canvas });

            event.clientX = 50;
            event.clientY = 25;
            simulatePointerEvent(eventName, config, canvas);

            expect(pntr.x).toBe(100);
            expect(pntr.y).toBe(50);
          });

          it('should take into account width style', () => {
            pntr.x = pntr.y = 0;

            pointer.resetPointers();
            canvas.style.width = canvas.width * 2 + 'px';
            pntr = pointer.initPointer({ canvas });

            event.clientX = 100;
            event.clientY = 50;
            simulatePointerEvent(eventName, config, canvas);

            expect(pntr.x).toBe(50);
            expect(pntr.y).toBe(25);
          });

          it('should take into account all style properties', () => {
            pntr.x = pntr.y = 0;

            pointer.resetPointers();
            canvas.style.border = '32px solid';
            canvas.style.padding = '32px';
            canvas.style.transform = 'scale(0.5)';
            canvas.style.transformOrigin = 'top left';
            canvas.style.width = canvas.width * 2 + 'px';
            pntr = pointer.initPointer({ canvas });

            event.clientX = 100;
            event.clientY = 50;
            simulatePointerEvent(eventName, config, canvas);

            expect(pntr.x).toBe(68);
            expect(pntr.y).toBe(18);
          });

          it(`should call the ${pointerHandler} function`, () => {
            let spy = jest.fn();
            pointer.onPointer(pointerHandler, spy);
            event.clientX = 100;
            event.clientY = 50;
            simulatePointerEvent(eventName, config, canvas);

            expect(spy).toHaveBeenCalled();
          });

          it(`should unregister the ${pointerHandler} function`, () => {
            let spy = jest.fn();
            pointer.onPointer(pointerHandler, spy);
            pointer.offPointer(pointerHandler);
            event.clientX = 100;
            event.clientY = 50;
            simulatePointerEvent(eventName, config, canvas);

            expect(spy).not.toHaveBeenCalled();
          });

          it(`should call the objects ${eventHandler} function if it is the target`, () => {
            object[eventHandler] = jest.fn();
            event.clientX = 105;
            event.clientY = 55;
            simulatePointerEvent(eventName, config, canvas);

            expect(object[eventHandler]).toHaveBeenCalled();
          });

          it('should take into account object anchor', () => {
            object.anchor = {
              x: 0.5,
              y: 0.5
            };
            object[eventHandler] = jest.fn();
            event.clientX = 110;
            event.clientY = 55;
            simulatePointerEvent(eventName, config, canvas);

            expect(object[eventHandler]).not.toHaveBeenCalled();

            event.clientX = 95;
            event.clientY = 55;
            simulatePointerEvent(eventName, config, canvas);

            expect(object[eventHandler]).toHaveBeenCalled();
          });

          it('should handle objects from different canvas', () => {
            let otherCanvas = document.createElement('canvas');
            document.body.appendChild(otherCanvas);
            otherCanvas.width = otherCanvas.height = 600;
            otherCanvas.style.position = 'fixed';
            otherCanvas.style.top = 0;
            otherCanvas.style.left = 0;

            pointer.initPointer({ canvas: otherCanvas });

            let obj = {
              x: 100,
              y: 50,
              width: 10,
              height: 20,
              render: noop,
              [eventHandler]: jest.fn(),
              context: { canvas: otherCanvas }
            };
            pointer.track(obj);
            obj.render();
            emit('tick');

            // wrong canvas
            event.clientX = 105;
            event.clientY = 55;
            simulatePointerEvent(eventName, config, canvas);
            expect(obj[eventHandler]).not.toHaveBeenCalled();

            simulatePointerEvent(eventName, config, otherCanvas);
            expect(obj[eventHandler]).toHaveBeenCalled();
          });

          if (eventName === 'touchstart') {
            it('should create a new touch in pointer.touches', () => {
              pntr.x = pntr.y = 0;
              event.clientX = 100;
              event.clientY = 50;
              simulatePointerEvent(eventName, config, canvas);

              expect(pntr.touches.length).toBe(1);
              expect(pntr.touches[0]).toEqual({
                start: {
                  x: 100,
                  y: 50
                },
                x: 100,
                y: 50,
                changed: true
              });
            });

            it('should not create new touch for already existing touches', () => {
              pntr.x = pntr.y = 0;
              event.clientX = 100;
              event.clientY = 50;
              simulatePointerEvent(eventName, config, canvas);

              let touch = {
                identifier: 1,
                clientX: 10,
                clientY: 20
              };
              event.clientX = 30;
              event.clientY = 40;
              simulatePointerEvent(
                eventName,
                {
                  // don't modify the original config
                  ...config,
                  touches: config.touches.concat(touch),
                  changedTouches: config.changedTouches.concat(touch)
                },
                canvas
              );

              expect(pntr.touches.length).toBe(2);
              expect(pntr.touches[0]).toEqual({
                start: {
                  x: 100,
                  y: 50
                },
                x: 30,
                y: 40,
                changed: true
              });
              expect(pntr.touches[1]).toEqual({
                start: {
                  x: 10,
                  y: 20
                },
                x: 10,
                y: 20,
                changed: true
              });
            });

            it('should emit touchChanged', () => {
              let spy = jest.fn();
              on('touchChanged', spy);
              simulatePointerEvent(eventName, config, canvas);
              expect(spy).toHaveBeenCalledWith(
                expect.any(Event),
                pntr.touches
              );
            });

            it('should emit touchChanged for each changed touch', () => {
              let spy = jest.fn();
              on('touchChanged', spy);

              let touch = {
                identifier: 1,
                clientX: 10,
                clientY: 20
              };
              simulatePointerEvent(
                eventName,
                {
                  ...config,
                  touches: config.touches.concat(touch),
                  changedTouches: config.changedTouches.concat(touch)
                },
                canvas
              );

              expect(spy).toHaveBeenCalledTimes(2);
            });
          }

          if (eventName === 'touchend') {
            it('should remove the touch', () => {
              simulatePointerEvent('touchstart', config, canvas);
              expect(pntr.touches.length).toBe(1);
              expect(pntr.touches[0]).toBeDefined();

              simulatePointerEvent(eventName, config, canvas);
              expect(pntr.touches.length).toBe(0);
              expect(pntr.touches[0]).toBeUndefined();
            });

            it('should remove each changed touch', () => {
              let touch = {
                identifier: 1,
                clientX: 10,
                clientY: 20
              };
              simulatePointerEvent(
                'touchstart',
                {
                  ...config,
                  touches: config.touches.concat(touch),
                  changedTouches: config.changedTouches.concat(touch)
                },
                canvas
              );
              expect(pntr.touches.length).toBe(2);

              simulatePointerEvent(eventName, config, canvas);
              expect(pntr.touches.length).toBe(1);
              expect(pntr.touches[0]).toBeUndefined();
              expect(pntr.touches[1]).toBeDefined();

              simulatePointerEvent(
                eventName,
                {
                  ...config,
                  touches: [touch],
                  changedTouches: [touch]
                },
                canvas
              );
              expect(pntr.touches.length).toBe(0);
            });

            it('should emit touchEnd when all touches are removed', () => {
              let spy = jest.fn();
              on('touchEnd', spy);

              let touch = {
                identifier: 1,
                clientX: 10,
                clientY: 20
              };
              simulatePointerEvent(
                'touchstart',
                {
                  ...config,
                  touches: config.touches.concat(touch),
                  changedTouches: config.changedTouches.concat(touch)
                },
                canvas
              );

              simulatePointerEvent(eventName, config, canvas);
              expect(spy).not.toHaveBeenCalled();

              simulatePointerEvent(
                eventName,
                {
                  ...config,
                  touches: [touch],
                  changedTouches: [touch]
                },
                canvas
              );
              expect(spy).toHaveBeenCalled();
            });
          }
        });
      }
    );
  });
});
