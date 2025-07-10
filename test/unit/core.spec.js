import * as core from '../../src/core.js';
import { on } from '../../src/events.js';

// --------------------------------------------------
// core
// --------------------------------------------------
describe('core', () => {
  // ensure no canvas exists since these tests set it up
  beforeEach(() => {
    document
      .querySelectorAll('canvas')
      .forEach(canvas => canvas.remove());
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should export api', () => {
      expect(typeof core.init).toBe('function');
      expect(typeof core.getCanvas).toBe('function');
      expect(typeof core.getContext).toBe('function');
    });

    it('should log an error if no canvas element exists', () => {
      function func() {
        core.init();
      }

      expect(func).toThrow();
    });

    it('should set the canvas when passed no arguments', () => {
      let canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      document.body.appendChild(canvas);

      core.init();

      expect(core.getCanvas()).toBe(canvas);
    });

    it('should set the canvas when passed an id', () => {
      let canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      canvas.id = 'game';
      document.body.appendChild(canvas);

      core.init('game');

      expect(core.getCanvas()).toBe(canvas);
    });

    it('should set the canvas when passed a canvas element', () => {
      let canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      canvas.id = 'game2';
      document.body.appendChild(canvas);

      core.init(canvas);

      expect(core.getCanvas()).toBe(canvas);
    });

    it('should set the context from the canvas', () => {
      let canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      canvas.id = 'game2';
      document.body.appendChild(canvas);

      core.init(canvas);

      expect(core.getContext().canvas).toBe(canvas);
    });

    it('should emit the init event', async () => {
      let canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      canvas.id = 'game2';
      document.body.appendChild(canvas);

      const initPromise = new Promise(resolve => {
        on('init', resolve);
      });

      core.init();

      await initPromise;
    });

    it('should return the canvas and context', () => {
      let c = document.createElement('canvas');
      c.width = 600;
      c.height = 600;
      c.id = 'game2';
      document.body.appendChild(c);

      let { canvas, context } = core.init();

      expect(canvas).toBe(c);
      expect(context).toBe(c.getContext('2d'));
    });

    it('should allow contextless option', () => {
      let { canvas, context } = core.init(null, {
        contextless: true
      });

      expect(canvas._proxy).toBe(true);
      expect(context._proxy).toBe(true);

      function fn() {
        canvas.getContext('2d');
        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.translate(0, 0);
        context.globalAlpha = 10;
        context.restore();
        context.doesNotExist();
      }

      expect(fn).not.toThrow();
    });
  });
});
