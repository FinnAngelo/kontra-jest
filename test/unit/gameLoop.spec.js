import GameLoop from '../../src/gameLoop.js';
import { _reset, init, getContext } from '../../src/core.js';
import { on } from '../../src/events.js';
import { noop } from '../../src/utils.js';
import { simulateEvent } from '../utils.js';

// --------------------------------------------------
// gameloop
// --------------------------------------------------
describe('gameLoop', () => {
  let loop;

  afterEach(() => {
    loop && loop.stop();
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should log an error if not passed required functions', () => {
      function func() {
        GameLoop();
      }

      expect(func).toThrow();
    });

    it('should set context if kontra.init is called after created', () => {
      _reset();

      let loop = GameLoop({
        render: noop
      });

      expect(loop.context).toBeUndefined();

      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);

      expect(loop.context).toBe(canvas.getContext('2d'));
    });

    it('should not override context when set if kontra.init is called after created', () => {
      _reset();

      let loop = GameLoop({
        render: noop,
        context: true
      });

      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);

      expect(loop.context).toBe(true);
    });
  });

  // --------------------------------------------------
  // start
  // --------------------------------------------------
  describe('start', () => {
    it('should call requestAnimationFrame', () => {
      const spy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(noop);

      loop = GameLoop({
        render: noop,
        clearCanvas: false
      });

      loop.start();

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should unset isStopped', () => {
      loop.isStopped = true;
      loop.start();

      expect(loop.isStopped).toBe(false);
    });

    it('should call requestAnimationFrame only once if called twice', () => {
      const spy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(noop);

      loop = GameLoop({
        render: noop,
        clearCanvas: false
      });

      loop.start();
      loop.start();

      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });
  });

  // --------------------------------------------------
  // stop
  // --------------------------------------------------
  describe('stop', () => {
    it('should call cancelAnimationFrame', () => {
      const spy = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(noop);

      loop = GameLoop({
        render: noop,
        clearCanvas: false
      });

      loop.stop();

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should set isStopped', () => {
      loop.isStopped = false;
      loop.stop();

      expect(loop.isStopped).toBe(true);
    });
  });

  // --------------------------------------------------
  // frame
  // --------------------------------------------------
  describe('frame', () => {
    it('should call the update function and pass it dt', done => {
      const updateSpy = jest.fn();
      loop = GameLoop({
        update: updateSpy,
        render: noop,
        clearCanvas: false
      });

      loop.start();

      setTimeout(() => {
        expect(updateSpy).toHaveBeenCalled();
        expect(updateSpy.mock.calls[0][0]).toBe(1 / 60);
        done();
      }, 250);
    });

    it('should call the render function', done => {
      const renderSpy = jest.fn();
      loop = GameLoop({
        render: renderSpy,
        clearCanvas: false
      });

      loop.start();

      setTimeout(() => {
        expect(renderSpy).toHaveBeenCalled();
        done();
      }, 250);
    });

    it('should exit early if time elapsed is greater than 1000ms', () => {
      let count = 0;

      loop = GameLoop({
        update() {
          count++;
        },
        render: noop,
        clearCanvas: false
      });

      loop._last = performance.now() - 1500;
      loop._frame();

      expect(count).toBe(0);
    });

    it('should make multiple calls to the update function if enough time has elapsed', () => {
      let count = 0;

      loop = GameLoop({
        update() {
          count++;
        },
        render: noop,
        clearCanvas: false
      });

      loop._last = performance.now() - (1e3 / 60) * 2.5;
      loop._frame();

      expect(count).toBe(2);
    });

    it('should change the frame rate if passed fps', () => {
      let count = 0;

      loop = GameLoop({
        update() {
          count++;
        },
        render: noop,
        clearCanvas: false,
        fps: 30
      });

      loop._last = performance.now() - (1e3 / 60) * 2.5;
      loop._frame();

      expect(count).toBe(1);
    });

    it('should call clearCanvas by default', () => {
      loop = GameLoop({
        render: noop
      });
      let context = getContext();

      const spy = jest.spyOn(context, 'clearRect').mockImplementation(noop);

      loop._last = performance.now() - 1e3 / 60;
      loop._frame();

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should not clear the canvas if clearCanvas is false', () => {
      loop = GameLoop({
        render: noop,
        clearCanvas: false
      });
      let context = getContext();

      const spy = jest.spyOn(context, 'clearRect').mockImplementation(noop);

      loop._last = performance.now() - 1e3 / 60;
      loop._frame();

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should call clearCanvas on the passed in context', () => {
      const clearRectSpy = jest.fn();
      let context = {
        canvas: {
          width: 0,
          height: 0
        },
        clearRect: clearRectSpy
      };

      loop = GameLoop({
        render: noop,
        context
      });

      loop._last = performance.now() - 1e3 / 60;
      loop._frame();

      expect(clearRectSpy).toHaveBeenCalled();
    });

    it('should emit the tick event', () => {
      const spy = jest.fn();
      on('tick', spy);

      loop = GameLoop({
        render: noop
      });
      loop._last = performance.now() - 1001 / 60;
      loop._frame();

      expect(spy).toHaveBeenCalled();
    });

    it('should emit the tick event for each loop update', () => {
      const spy = jest.fn();
      on('tick', spy);

      loop = GameLoop({
        render: noop
      });
      loop._last = performance.now() - 2001 / 60;
      loop._frame();

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should not update if page is blurred', done => {
      loop = GameLoop({
        update() {
          throw new Error('should not get here');
        },
        render: noop
      });
      simulateEvent('blur');
      loop._last = performance.now() - 1e3 / 60;
      loop._frame();

      setTimeout(done, 100);
    });

    it('should update if page is blurred when blur is true', () => {
      let updateCalled = false;
      loop = GameLoop({
        blur: true,
        update() {
          updateCalled = true;
        },
        render: noop
      });
      simulateEvent('blur');
      loop._last = performance.now() - Math.ceil(1e3 / 60);
      loop._frame();

      expect(updateCalled).toBe(true);
    });
  });
});
