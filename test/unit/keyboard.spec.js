import * as keyboard from '../../src/keyboard.js';
import { simulateEvent } from '../utils.js';

// --------------------------------------------------
// keyboard
// --------------------------------------------------
describe('keyboard', () => {
  // reset pressed keys before each test
  beforeEach(() => {
    simulateEvent('blur');
  });

  it('should export api', () => {
    // full keyMap api is only exported after initKeys
    keyboard.initKeys();

    expect(keyboard.keyMap).toEqual({
      Enter: 'enter',
      Escape: 'esc',
      Space: 'space',
      ArrowLeft: 'arrowleft',
      ArrowUp: 'arrowup',
      ArrowRight: 'arrowright',
      ArrowDown: 'arrowdown',
      KeyA: 'a',
      KeyB: 'b',
      KeyC: 'c',
      KeyD: 'd',
      KeyE: 'e',
      KeyF: 'f',
      KeyG: 'g',
      KeyH: 'h',
      KeyI: 'i',
      KeyJ: 'j',
      KeyK: 'k',
      KeyL: 'l',
      KeyM: 'm',
      KeyN: 'n',
      KeyO: 'o',
      KeyP: 'p',
      KeyQ: 'q',
      KeyR: 'r',
      KeyS: 's',
      KeyT: 't',
      KeyU: 'u',
      KeyV: 'v',
      KeyW: 'w',
      KeyX: 'x',
      KeyY: 'y',
      KeyZ: 'z',
      Numpad0: '0',
      Digit0: '0',
      Numpad1: '1',
      Digit1: '1',
      Numpad2: '2',
      Digit2: '2',
      Numpad3: '3',
      Digit3: '3',
      Numpad4: '4',
      Digit4: '4',
      Numpad5: '5',
      Digit5: '5',
      Numpad6: '6',
      Digit6: '6',
      Numpad7: '7',
      Digit7: '7',
      Numpad8: '8',
      Digit8: '8',
      Numpad9: '9',
      Digit9: '9'
    });

    expect(keyboard.initKeys).toEqual(expect.any(Function));
    expect(keyboard.onKey).toEqual(expect.any(Function));
    expect(keyboard.offKey).toEqual(expect.any(Function));
    expect(keyboard.keyPressed).toEqual(expect.any(Function));
  });

  // --------------------------------------------------
  // initKeys
  // --------------------------------------------------
  describe('initKeys', () => {
    it('should add event listeners', () => {
      const spy = jest.spyOn(window, 'addEventListener');

      keyboard.initKeys();

      expect(spy).toHaveBeenCalled();
      
      spy.mockRestore();
    });
  });

  // --------------------------------------------------
  // pressed
  // --------------------------------------------------
  describe('pressed', () => {
    it('should return false when a key is not pressed', () => {
      expect(keyboard.keyPressed('a')).toBe(false);
      expect(keyboard.keyPressed('f1')).toBe(false);
      expect(keyboard.keyPressed('numpad0')).toBe(false);
    });

    it('should return true for a single key', () => {
      simulateEvent('keydown', { code: 'KeyA' });

      expect(keyboard.keyPressed('a')).toBe(true);
    });

    it('should return false if the key is no longer pressed', () => {
      simulateEvent('keydown', { code: 'KeyA' });
      simulateEvent('keyup', { code: 'KeyA' });

      expect(keyboard.keyPressed('a')).toBe(false);
    });

    it('should accept an array of key combinations', () => {
      simulateEvent('keydown', { code: 'KeyC' });

      expect(keyboard.keyPressed(['a','b','c'])).toBe(true);
    });
  });

  // --------------------------------------------------
  // onKey
  // --------------------------------------------------
  describe('onKey', () => {
    // Defaults to keydown
    describe('handler=keydown', () => {
      it('should call the callback when a single key combination is pressed', done => {
        keyboard.onKey('a', () => {
          done();
        });

        simulateEvent('keydown', { code: 'KeyA' });
      });

      it('should accept an array of key combinations to register', done => {
        keyboard.onKey(['a', 'b'], () => {
          done();
        });

        simulateEvent('keydown', { code: 'KeyB' });
      });
    });

    describe('handler=keyup', () => {
      const handler = 'keyup';

      it('should call the callback when a single key combination is pressed', done => {
        keyboard.onKey(
          'a',
          () => {
            done();
          },
          { handler }
        );

        simulateEvent('keyup', { code: 'KeyA' });
      });

      it('should accept an array of key combinations to register', done => {
        keyboard.onKey(
          ['a', 'b'],
          () => {
            done();
          },
          { handler }
        );

        simulateEvent('keyup', { code: 'KeyB' });
      });
    });

    describe('preventDefault=true', () => {
      it('should call preventDefault on the event', (done) => {
        keyboard.initKeys();

        keyboard.onKey('a', () => {
          expect(mockPreventDefault).toHaveBeenCalled();
          done();
        });

        const mockPreventDefault = jest.fn();
        const event = simulateEvent('keydown', {
          code: 'KeyA',
          async: true
        });
        event.preventDefault = mockPreventDefault;
      });
    });

    describe('preventDefault=false', () => {
      it('should not call preventDefault on the event', (done) => {
        keyboard.onKey(
          'a',
          evt => {
            expect(evt.defaultPrevented).toBe(false);
            done();
          },
          { preventDefault: false }
        );

        simulateEvent('keydown', { code: 'KeyA' });
      });
    });
  });

  // --------------------------------------------------
  // offKey
  // --------------------------------------------------
  describe('offKey', () => {
    // Defaults to keydown
    describe('handler=keydown', () => {
      it('should not call the callback when the combination has been unregistered', () => {
        const callback = jest.fn();
        keyboard.onKey('a', callback);

        keyboard.offKey('a');

        simulateEvent('keydown', { which: 65 });
        
        expect(callback).not.toHaveBeenCalled();
      });

      it('should accept an array of key combinations to unregister', () => {
        const callback = jest.fn();
        keyboard.onKey(['a', 'b'], callback);

        keyboard.offKey(['a', 'b']);

        simulateEvent('keydown', { which: 65 });
        simulateEvent('keydown', { which: 66 });
        
        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe('handler=keyup', () => {
      const handler = 'keyup';

      it('should not call the callback when the combination has been unregistered', () => {
        const callback = jest.fn();
        keyboard.onKey(
          'a',
          callback,
          { handler }
        );

        keyboard.offKey('a');

        simulateEvent('keyup', { which: 65 });
        
        expect(callback).not.toHaveBeenCalled();
      });

      it('should accept an array of key combinations to unregister', () => {
        const callback = jest.fn();
        keyboard.onKey(
          ['a', 'b'],
          callback,
          { handler }
        );

        keyboard.offKey(['a', 'b']);

        simulateEvent('keyup', { which: 65 });
        simulateEvent('keyup', { which: 66 });
        
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });
});
