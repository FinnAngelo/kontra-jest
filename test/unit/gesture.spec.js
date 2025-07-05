import * as gesture from '../../src/gesture.js';
import {
  emit,
  callbacks as eventCallbacks
} from '../../src/events.js';

// --------------------------------------------------
// gesture
// --------------------------------------------------
describe('gesture', () => {
  afterEach(() => {
    emit('touchEnd');
  });

  it('should export api', () => {
    expect(Object.keys(gesture.gestureMap)).toEqual([
      'swipe',
      'pinch'
    ]);

    expect(gesture.initGesture).toEqual(expect.any(Function));
    expect(gesture.onGesture).toEqual(expect.any(Function));
    expect(gesture.offGesture).toEqual(expect.any(Function));
  });

  // --------------------------------------------------
  // initGesture
  // --------------------------------------------------
  describe('initGesture', () => {
    it('should listen for touchChanged and touchEnd', () => {
      expect(eventCallbacks.touchChanged).toBeUndefined();
      expect(eventCallbacks.touchEnd).toBeUndefined();

      gesture.initGesture();

      expect(eventCallbacks.touchChanged).toBeDefined();
      expect(eventCallbacks.touchEnd).toBeDefined();
    });

    it('should only listen to events once', () => {
      gesture.initGesture();
      gesture.initGesture();

      expect(eventCallbacks.touchChanged.length).toBe(1);
      expect(eventCallbacks.touchEnd.length).toBe(1);
    });
  });

  // --------------------------------------------------
  // onGesture
  // --------------------------------------------------
  describe('onGesture', () => {
    beforeEach(() => {
      gesture.initGesture();
    });

    it('should add the listener to callbacks', () => {
      function foo() {}
      gesture.onGesture('swipeleft', foo);
      expect(gesture.callbacks.swipeleft).toBe(foo);
    });

    it('should add an array of listeners', () => {
      function foo() {}
      gesture.onGesture(['swipeleft', 'swiperight'], foo);
      expect(gesture.callbacks.swipeleft).toBe(foo);
      expect(gesture.callbacks.swiperight).toBe(foo);
    });
  });

  // --------------------------------------------------
  // offGesture
  // --------------------------------------------------
  describe('offGesture', () => {
    beforeEach(() => {
      gesture.initGesture();
    });

    it('should remove the listener', () => {
      function foo() {}
      gesture.onGesture('swipeleft', foo);
      gesture.offGesture('swipeleft', foo);
      expect(gesture.callbacks.swipeleft).toBe(0);
    });

    it('should remove an array of listeners', () => {
      function foo() {}
      gesture.onGesture(['swipeleft', 'swiperight'], foo);
      gesture.offGesture(['swipeleft', 'swiperight'], foo);
      expect(gesture.callbacks.swipeleft).toBe(0);
      expect(gesture.callbacks.swiperight).toBe(0);
    });
  });

  // --------------------------------------------------
  // swipe
  // --------------------------------------------------
  describe('swipe', () => {
    beforeEach(() => {
      gesture.initGesture();
    });

    it('should call swipeleft callback', () => {
      let spy = jest.fn();
      gesture.onGesture('swipeleft', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 30,
          y: 50
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy).toHaveBeenCalledWith(evt, touches);
    });

    it('should call swiperight callback', () => {
      let spy = jest.fn();
      gesture.onGesture('swiperight', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 90,
          y: 50
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy).toHaveBeenCalledWith(evt, touches);
    });

    it('should call swipeup callback', () => {
      let spy = jest.fn();
      gesture.onGesture('swipeup', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 50,
          y: 30
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy).toHaveBeenCalledWith(evt, touches);
    });

    it('should call swipedown callback', () => {
      let spy = jest.fn();
      gesture.onGesture('swipedown', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 50,
          y: 90
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy).toHaveBeenCalledWith(evt, touches);
    });

    it('should not call callback if threshold is not great enough', () => {
      let spy = jest.fn();
      gesture.onGesture('swipeleft', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 45,
          y: 50
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call callback if there are too many touches', () => {
      let spy = jest.fn();
      gesture.onGesture('swipeleft', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 2,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 45,
          y: 50
        },
        1: {
          start: {
            x: 90,
            y: 90
          },
          x: 30,
          y: 40
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call callback on wrong touch event', () => {
      let spy = jest.fn();
      gesture.onGesture('swipeleft', spy);

      let evt = { type: 'touchmove' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 30,
          y: 50
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call callback if touch is wrong index', () => {
      let spy = jest.fn();
      gesture.onGesture('swipeleft', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        1: {
          start: {
            x: 50,
            y: 50
          },
          x: 30,
          y: 50
        }
      };

      emit('touchChanged', evt, touches);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // pinch
  // --------------------------------------------------
  describe('pinch', () => {
    beforeEach(() => {
      gesture.initGesture();
    });

    it('should call pinchout callback', () => {
      let spy = jest.fn();
      gesture.onGesture('pinchout', spy);

      let evt = { type: 'touchmove' };
      let touches = {
        length: 2,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 60,
          y: 50
        },
        1: {
          start: {
            x: 25,
            y: 25
          },
          x: 15,
          y: 25
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 2,
          0: {
            x: 50,
            y: 50
          },
          1: {
            x: 25,
            y: 25
          }
        }
      );
      emit('touchChanged', evt, touches);

      expect(spy).toHaveBeenCalledWith(evt, touches);
    });

    it('should call pinchin callback', () => {
      let spy = jest.fn();
      gesture.onGesture('pinchin', spy);

      let evt = { type: 'touchmove' };
      let touches = {
        length: 2,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 40,
          y: 50
        },
        1: {
          start: {
            x: 25,
            y: 25
          },
          x: 30,
          y: 25
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 2,
          0: {
            x: 50,
            y: 50
          },
          1: {
            x: 25,
            y: 25
          }
        }
      );
      emit('touchChanged', evt, touches);

      expect(spy).toHaveBeenCalledWith(evt, touches);
    });

    it('should not call callback if threshold is not great enough', () => {
      let spy = jest.fn();
      gesture.onGesture('pinchout', spy);

      let evt = { type: 'touchmove' };
      let touches = {
        length: 2,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 49,
          y: 50
        },
        1: {
          start: {
            x: 25,
            y: 25
          },
          x: 25,
          y: 25
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 2,
          0: {
            x: 50,
            y: 50
          },
          1: {
            x: 25,
            y: 25
          }
        }
      );
      emit('touchChanged', evt, touches);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call callback if there not enough touches', () => {
      let spy = jest.fn();
      gesture.onGesture('pinchout', spy);

      let evt = { type: 'touchmove' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 49,
          y: 50
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 1,
          0: {
            x: 50,
            y: 50
          }
        }
      );
      emit('touchChanged', evt, touches);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call callback on wrong touch event', () => {
      let spy = jest.fn();
      gesture.onGesture('pinchout', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 2,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 60,
          y: 50
        },
        1: {
          start: {
            x: 25,
            y: 25
          },
          x: 15,
          y: 25
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 2,
          0: {
            x: 50,
            y: 50
          },
          1: {
            x: 25,
            y: 25
          }
        }
      );
      emit('touchChanged', evt, touches);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call swipe at end of a pinch if 1 finger calls touchend', () => {
      let spy = jest.fn();
      gesture.onGesture('pinchin', jest.fn());
      gesture.onGesture('swipeleft', spy);

      let evt = { type: 'touchend' };
      let touches = {
        length: 1,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 30,
          y: 50
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 2,
          0: {
            x: 50,
            y: 50
          },
          1: {
            x: 25,
            y: 25
          }
        }
      );
      emit(
        'touchChanged',
        { type: 'touchmove' },
        {
          length: 2,
          0: {
            x: 20,
            y: 50
          },
          1: {
            x: 20,
            y: 25
          }
        }
      );

      emit('touchChanged', evt, touches);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call callback if touch is wrong index', () => {
      let spy = jest.fn();
      gesture.onGesture('pinchout', spy);

      let evt = { type: 'touchmove' };
      let touches = {
        length: 2,
        0: {
          start: {
            x: 50,
            y: 50
          },
          x: 60,
          y: 50
        },
        2: {
          start: {
            x: 25,
            y: 25
          },
          x: 15,
          y: 25
        }
      };

      emit(
        'touchChanged',
        { type: 'touchstart' },
        {
          length: 2,
          0: {
            x: 50,
            y: 50
          },
          1: {
            x: 25,
            y: 25
          }
        }
      );
      emit('touchChanged', evt, touches);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
