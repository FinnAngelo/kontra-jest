import * as input from '../../src/input.js';
import { getCanvas } from '../../src/core.js';
import {
  emit,
  callbacks as eventCallbacks
} from '../../src/events.js';
import { keyMap } from '../../src/keyboard.js';
import { gamepadMap, updateGamepad } from '../../src/gamepad.js';
import { gestureMap } from '../../src/gesture.js';
import { getPointer, resetPointers } from '../../src/pointer.js';
import {
  simulateEvent,
  createGamepad,
  getGamepadsStub
} from '../utils.js';

// --------------------------------------------------
// input
// --------------------------------------------------
describe('input', () => {
  beforeEach(() => {
    // Mock GamepadEvent if it doesn't exist
    if (typeof GamepadEvent === 'undefined') {
      global.GamepadEvent = class GamepadEvent extends Event {
        constructor(type, eventInitDict) {
          super(type, eventInitDict);
          this.gamepad = eventInitDict?.gamepad || null;
        }
      };
    }
    
    // Ensure navigator.getGamepads exists before spying on it
    if (!navigator.getGamepads) {
      navigator.getGamepads = jest.fn();
    }
    jest
      .spyOn(navigator, 'getGamepads')
      .mockReturnValue(getGamepadsStub);
    input.initInput();
  });

  afterEach(() => {
    resetPointers();
  });

  it('should export api', () => {
    expect(input.initInput).toEqual(expect.any(Function));
    expect(input.onInput).toEqual(expect.any(Function));
    expect(input.offInput).toEqual(expect.any(Function));
  });

  it('should have unique input names for each input type', () => {
    // if keyboard, gamepad, gesture, or pointer share an input name
    // it will cause problems
    let inputNames = [
      // keyboard can have non-unique keys
      ...Object.values(keyMap).filter((name, index, array) => {
        return array.indexOf(name) === index;
      }),
      ...Object.values(gamepadMap),
      ...Object.keys(gestureMap),
      ...['down', 'up']
    ];

    let isUnique = inputNames.every((name, index) => {
      return inputNames.indexOf(name) === index;
    });
    expect(isUnique).toBe(true);
  });

  // --------------------------------------------------
  // initInput
  // --------------------------------------------------
  describe('initInput', () => {
    it('should init inputs', () => {
      let windowSpy = jest.spyOn(window, 'addEventListener');
      let canvasSpy = jest.spyOn(getCanvas(), 'addEventListener');

      input.initInput();

      // keyboard
      expect(windowSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      // gamepad
      expect(windowSpy).toHaveBeenCalledWith('gamepadconnected', expect.any(Function));
      // gesture
      expect(eventCallbacks.touchChanged).toBeDefined();
      // pointer
      expect(canvasSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    });

    it('should pass pointer options', () => {
      resetPointers();
      input.initInput({
        pointer: { radius: 10 }
      });

      expect(getPointer().radius).toBe(10);
    });

    it('should return init objects', () => {
      let object = input.initInput();

      expect(object.pointer).toBeDefined();
    });
  });

  // --------------------------------------------------
  // onInput
  // --------------------------------------------------
  describe('onInput', () => {
    it('should call the callback for keyboard event', () => {
      let spy = jest.fn();
      input.onInput('arrowleft', spy);

      simulateEvent('keydown', { code: 'ArrowLeft' });

      expect(spy).toHaveBeenCalled();
    });

    it('should call the callback for gamepad event', () => {
      let spy = jest.fn();
      input.onInput('south', spy);

      createGamepad();
      getGamepadsStub[0].buttons[0].pressed = true;
      updateGamepad();

      expect(spy).toHaveBeenCalled();
    });

    it('should call the callback for gesture event', () => {
      let spy = jest.fn();
      input.onInput('swipeleft', spy);

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

      expect(spy).toHaveBeenCalled();
    });

    it('should call the callback for pointer event', () => {
      let spy = jest.fn();
      input.onInput('down', spy);

      simulateEvent(
        'mousedown',
        {
          identifier: 0,
          clientX: 1000,
          clientY: 50
        },
        getCanvas()
      );

      expect(spy).toHaveBeenCalled();
    });

    it('should accept an array of inputs', () => {
      let spy = jest.fn();
      input.onInput(['dpadleft', 'arrowleft', 'swipeleft'], spy);

      simulateEvent('keydown', { code: 'ArrowLeft' });

      expect(spy).toHaveBeenCalled();
    });

    it('should pass keyboard options', () => {
      let spy = jest.fn();
      input.onInput('arrowleft', spy, {
        key: { handler: 'keyup' }
      });

      simulateEvent('keyup', { code: 'ArrowLeft' });

      expect(spy).toHaveBeenCalled();
    });

    it('should pass gamepad options', () => {
      let spy = jest.fn();
      input.onInput('south', spy, {
        gamepad: { handler: 'gamepadup' }
      });

      createGamepad();
      getGamepadsStub[0].buttons[0].pressed = true;
      updateGamepad();

      expect(spy).not.toHaveBeenCalled();

      getGamepadsStub[0].buttons[0].pressed = false;
      updateGamepad();

      expect(spy).toHaveBeenCalled();
    });

    it('should throw error if input name is invalid', () => {
      function fn() {
        input.onInput('foo', () => {});
      }

      expect(fn).toThrow();
    });
  });

  // --------------------------------------------------
  // offInput
  // --------------------------------------------------
  describe('offInput', () => {
    it('should not call the callback for keyboard event', () => {
      let spy = jest.fn();
      input.onInput('arrowleft', spy);
      input.offInput('arrowleft');

      simulateEvent('keydown', { code: 'ArrowLeft' });

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call the callback for gamepad event', () => {
      let spy = jest.fn();
      input.onInput('south', spy);
      input.offInput('south');

      createGamepad();
      getGamepadsStub[0].buttons[0].pressed = true;
      updateGamepad();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call the callback for gesture event', () => {
      let spy = jest.fn();
      input.onInput('swipeleft', spy);
      input.offInput('swipeleft');

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

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call the callback for pointer event', () => {
      let spy = jest.fn();
      input.onInput('down', spy);
      input.offInput('down');

      simulateEvent(
        'mousedown',
        {
          identifier: 0,
          clientX: 1000,
          clientY: 50
        },
        getCanvas()
      );

      expect(spy).not.toHaveBeenCalled();
    });

    it('should accept an array of inputs', () => {
      let spy = jest.fn();
      input.onInput(['dpadleft', 'arrowleft', 'swipeleft'], spy);
      input.offInput(['dpadleft', 'arrowleft']);

      simulateEvent('keydown', { code: 'ArrowLeft' });

      expect(spy).not.toHaveBeenCalled();
    });

    it('should pass keyboard options', () => {
      let spy = jest.fn();
      input.onInput('arrowleft', spy, {
        key: { handler: 'keyup' }
      });
      input.offInput('arrowleft', {
        key: { handler: 'keyup' }
      });

      simulateEvent('keyup', { code: 'ArrowLeft' });

      expect(spy).not.toHaveBeenCalled();
    });

    it('should pass gamepad options', () => {
      let spy = jest.fn();
      input.onInput('south', spy, {
        gamepad: { handler: 'gamepadup' }
      });
      input.offInput('south', {
        gamepad: { handler: 'gamepadup' }
      });

      createGamepad();
      getGamepadsStub[0].buttons[0].pressed = true;
      updateGamepad();
      getGamepadsStub[0].buttons[0].pressed = false;
      updateGamepad();

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
