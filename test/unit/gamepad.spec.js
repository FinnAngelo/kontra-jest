import * as gamepad from '../../src/gamepad.js';
import { callbacks as eventCallbacks } from '../../src/events.js';
import {
  simulateEvent,
  getGamepadsStub,
  createGamepad
} from '../utils.js';

// Mock GamepadEvent for Jest environment
global.GamepadEvent = global.GamepadEvent || class GamepadEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.gamepad = options.gamepad || null;
  }
};

// --------------------------------------------------
// gamepad
// --------------------------------------------------
describe('gamepad', () => {
  let getGamepadsSpy;

  beforeEach(() => {
    // Ensure navigator.getGamepads exists before spying on it
    if (!navigator.getGamepads) {
      navigator.getGamepads = jest.fn();
    }
    getGamepadsSpy = jest.spyOn(navigator, 'getGamepads').mockReturnValue(getGamepadsStub);
    gamepad.initGamepad();

    // reset pressed buttons before each test
    simulateEvent('blur');

    // start with 1 gamepad connected
    getGamepadsStub.length = 0;
    createGamepad();
  });

  afterEach(() => {
    if (getGamepadsSpy) {
      getGamepadsSpy.mockRestore();
    }
  });

  it('should export api', () => {
    expect(gamepad.gamepadMap).toEqual({
      0: 'south',
      1: 'east',
      2: 'west',
      3: 'north',
      4: 'leftshoulder',
      5: 'rightshoulder',
      6: 'lefttrigger',
      7: 'righttrigger',
      8: 'select',
      9: 'start',
      10: 'leftstick',
      11: 'rightstick',
      12: 'dpadup',
      13: 'dpaddown',
      14: 'dpadleft',
      15: 'dpadright'
    });

    expect(gamepad.updateGamepad).toEqual(expect.any(Function));
    expect(gamepad.initGamepad).toEqual(expect.any(Function));
    expect(gamepad.onGamepad).toEqual(expect.any(Function));
    expect(gamepad.offGamepad).toEqual(expect.any(Function));
    expect(gamepad.gamepadPressed).toEqual(expect.any(Function));
    expect(gamepad.gamepadAxis).toEqual(expect.any(Function));
  });

  // --------------------------------------------------
  // initGamepad
  // --------------------------------------------------
  describe('initGamepad', () => {
    it('should add event listeners', () => {
      let num = eventCallbacks.tick?.length || 0;
      const spy = jest.spyOn(window, 'addEventListener');

      gamepad.initGamepad();

      expect(spy).toHaveBeenCalledWith('gamepadconnected', expect.any(Function));
      expect(spy).toHaveBeenCalledWith('gamepaddisconnected', expect.any(Function));
      expect(spy).toHaveBeenCalledWith('blur', expect.any(Function));
      expect(eventCallbacks.tick.length).toBe(num + 1);
      
      spy.mockRestore();
    });
  });

  // --------------------------------------------------
  // onGamepad
  // --------------------------------------------------
  describe('onGamepad', () => {
    describe('handler=gamepaddown', () => {
      it('should call the callback when a button is pressed', () => {
        const spy = jest.fn();
        gamepad.onGamepad('south', spy);

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy).toHaveBeenCalledWith(
          getGamepadsStub[0],
          getGamepadsStub[0].buttons[0],
          'south'
        );
      });

      it('should accept an array of buttons', () => {
        let spy = jest.fn();
        gamepad.onGamepad(['south', 'north'], spy);

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy).toHaveBeenCalledWith(
          getGamepadsStub[0],
          getGamepadsStub[0].buttons[0],
          'south'
        );
      });

      it('should accept a gamepad index', () => {
        createGamepad();

        let spy = jest.fn();
        gamepad.onGamepad('south', spy, { gamepad: 1 });

        getGamepadsStub[1].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy).toHaveBeenCalledWith(
          getGamepadsStub[1],
          getGamepadsStub[1].buttons[0],
          'south'
        );
      });

      it('should allow global and specific callback', () => {
        let globalSpy = jest.fn();
        let gamepadSpy = jest.fn();
        gamepad.onGamepad('south', globalSpy);
        gamepad.onGamepad('south', gamepadSpy, { gamepad: 0 });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(globalSpy).toHaveBeenCalled();
        expect(gamepadSpy).toHaveBeenCalled();
      });

      it('should not throw error if gamepad is not connected', () => {
        function fn() {
          gamepad.onGamepad('south', jest.fn(), { gamepad: 1 });
        }

        expect(fn).not.toThrow();
      });

      describe('multiple controllers', () => {
        it('should call the global callback if any gamepad pressed the button', () => {
          createGamepad();
          createGamepad();
          createGamepad();

          let spy = jest.fn();
          gamepad.onGamepad('north', spy);

          getGamepadsStub[3].buttons[3].pressed = true;
          gamepad.updateGamepad();

          expect(spy).toHaveBeenCalledWith(
            getGamepadsStub[3],
            getGamepadsStub[3].buttons[3],
            'north'
          );
        });

        it('should not call gamepad callback if the gamepad did not press the button', () => {
          createGamepad();
          createGamepad();
          createGamepad();

          let spy = jest.fn();
          gamepad.onGamepad('north', spy, { gamepad: 1 });

          getGamepadsStub[3].buttons[3].pressed = true;
          gamepad.updateGamepad();

          expect(spy).not.toHaveBeenCalled();
        });
      });
    });

    describe('handler=gamepadup', () => {
      it('should call the callback when a button is released', () => {
        let spy = jest.fn();
        gamepad.onGamepad('south', spy, { handler: 'gamepadup' });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy).not.toHaveBeenCalled();

        getGamepadsStub[0].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(spy).toHaveBeenCalledWith(
          getGamepadsStub[0],
          getGamepadsStub[0].buttons[0],
          'south'
        );
      });

      it('should accept an array of buttons', () => {
        let spy = jest.fn();
        gamepad.onGamepad(['south', 'north'], spy, {
          handler: 'gamepadup'
        });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy).not.toHaveBeenCalled();

        getGamepadsStub[0].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(spy).toHaveBeenCalledWith(
          getGamepadsStub[0],
          getGamepadsStub[0].buttons[0],
          'south'
        );
      });

      it('should accept a gamepad index', () => {
        createGamepad();

        let spy = jest.fn();
        gamepad.onGamepad('south', spy, {
          handler: 'gamepadup',
          gamepad: 1
        });

        getGamepadsStub[1].buttons[0].pressed = true;
        gamepad.updateGamepad();
        getGamepadsStub[1].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(spy).toHaveBeenCalledWith(
          getGamepadsStub[1],
          getGamepadsStub[1].buttons[0],
          'south'
        );        });

      it('should allow global and specific callback', () => {
        let globalSpy = jest.fn();
        let gamepadSpy = jest.fn();
        gamepad.onGamepad('south', globalSpy, {
          handler: 'gamepadup'
        });
        gamepad.onGamepad('south', gamepadSpy, {
          handler: 'gamepadup',
          gamepad: 0
        });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();
        getGamepadsStub[0].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(globalSpy).toHaveBeenCalled();
        expect(gamepadSpy).toHaveBeenCalled();
      });

      it('should not throw error if gamepad is not connected', () => {
        function fn() {
          gamepad.onGamepad('south', jest.fn(), {
            handler: 'gamepadup',
            gamepad: 1
          });
        }

        expect(fn).not.toThrow();
      });
    });
  });

  // --------------------------------------------------
  // offGamepad
  // --------------------------------------------------
  describe('offGamepad', () => {
    describe('handler=gamepaddown', () => {
      it('should not call the callback when a button is pressed', () => {
        let spy = jest.fn();
        gamepad.onGamepad('south', spy);
        gamepad.offGamepad('south');

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy).not.toHaveBeenCalled();
      });

      it('should accept an array of buttons', () => {
        let spy = jest.fn();
        gamepad.onGamepad('south', spy);
        gamepad.offGamepad(['south', 'north'], spy);

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy).not.toHaveBeenCalled();
      });

      it('should accept a gamepad index', () => {
        createGamepad();

        let spy = jest.fn();
        gamepad.onGamepad('south', spy, { gamepad: 1 });
        gamepad.offGamepad('south', { gamepad: 1 });

        getGamepadsStub[1].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(spy).not.toHaveBeenCalled();
      });

      it('should allow global and specific callback', () => {
        let globalSpy = jest.fn();
        let gamepadSpy = jest.fn();
        gamepad.onGamepad('south', globalSpy);
        gamepad.onGamepad('south', gamepadSpy, { gamepad: 0 });

        gamepad.offGamepad('south');
        gamepad.offGamepad('south', { gamepad: 0 });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();

        expect(globalSpy).not.toHaveBeenCalled();
        expect(gamepadSpy).not.toHaveBeenCalled();
      });

      it('should not throw error if gamepad is not connected', () => {
        function fn() {
          gamepad.offGamepad('south', { gamepad: 1 });
        }

        expect(fn).not.toThrow();
      });
    });

    describe('handler=gamepadup', () => {
      it('should not call the callback when a button is released', () => {
        let spy = jest.fn();
        gamepad.onGamepad('south', spy, { handler: 'gamepadup' });
        gamepad.offGamepad('south', { handler: 'gamepadup' });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();
        getGamepadsStub[0].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(spy).not.toHaveBeenCalled();
      });

      it('should accept an array of buttons', () => {
        let spy = jest.fn();
        gamepad.onGamepad('south', spy, { handler: 'gamepadup' });
        gamepad.offGamepad(['south', 'north'], {
          handler: 'gamepadup'
        });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();
        getGamepadsStub[0].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(spy).not.toHaveBeenCalled();
      });

      it('should accept a gamepad index', () => {
        createGamepad();

        let spy = jest.fn();
        gamepad.onGamepad('south', spy, {
          handler: 'gamepadup',
          gamepad: 1
        });
        gamepad.offGamepad('south', {
          handler: 'gamepadup',
          gamepad: 1
        });

        getGamepadsStub[1].buttons[0].pressed = true;
        gamepad.updateGamepad();
        getGamepadsStub[1].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(spy).not.toHaveBeenCalled();
      });

      it('should allow global and specific callback', () => {
        let globalSpy = jest.fn();
        let gamepadSpy = jest.fn();
        gamepad.onGamepad('south', globalSpy, {
          handler: 'gamepadup'
        });
        gamepad.onGamepad('south', gamepadSpy, {
          handler: 'gamepadup',
          gamepad: 0
        });

        gamepad.offGamepad('south', { handler: 'gamepadup' });
        gamepad.offGamepad('south', {
          handler: 'gamepadup',
          gamepad: 0
        });

        getGamepadsStub[0].buttons[0].pressed = true;
        gamepad.updateGamepad();
        getGamepadsStub[0].buttons[0].pressed = false;
        gamepad.updateGamepad();

        expect(globalSpy).not.toHaveBeenCalled();
        expect(gamepadSpy).not.toHaveBeenCalled();
      });

      it('should not throw error if gamepad is not connected', () => {
        function fn() {
          gamepad.offGamepad('south', {
            handler: 'gamepadup',
            gamepad: 1
          });
        }

        expect(fn).not.toThrow();
      });
    });
  });

  // --------------------------------------------------
  // gampadPressed
  // --------------------------------------------------
  describe('gamepadPressed', () => {
    it('should return false if button is not pressed', () => {
      expect(gamepad.gamepadPressed('south')).toBe(false);
    });

    it('should return true if button is pressed', () => {
      getGamepadsStub[0].buttons[10].pressed = true;
      gamepad.updateGamepad();

      expect(gamepad.gamepadPressed('leftstick')).toBe(true);
    });

    it('should return false if button is released', () => {
      getGamepadsStub[0].buttons[10].pressed = true;
      gamepad.updateGamepad();
      getGamepadsStub[0].buttons[10].pressed = false;
      gamepad.updateGamepad();

      expect(gamepad.gamepadPressed('leftstick')).toBe(false);
    });

    it('should allow gamepad index', () => {
      createGamepad();

      getGamepadsStub[1].buttons[0].pressed = true;
      gamepad.updateGamepad();

      expect(gamepad.gamepadPressed('south', { gamepad: 1 })).toBe(true);
    });

    it('should return true if any gamepad has button pressed', () => {
      createGamepad();

      getGamepadsStub[1].buttons[0].pressed = true;
      gamepad.updateGamepad();

      expect(gamepad.gamepadPressed('south')).toBe(true);
    });

    it('should return false if gamepad is not connected', () => {
      expect(gamepad.gamepadPressed('south', { gamepad: 1 })).toBe(false);
    });
  });

  // --------------------------------------------------
  // gamepadAxis
  // --------------------------------------------------
  describe('gamepadAxis', () => {
    it('should return the value of the gamepad axis', () => {
      getGamepadsStub[0].axes[0] = 1;
      gamepad.updateGamepad();

      expect(gamepad.gamepadAxis('leftstickx', 0)).toBe(1);
    });

    it('should return 0 by default', () => {
      expect(gamepad.gamepadAxis('leftstickx', 0)).toBe(0);
    });

    it('should not throw error if gamepad is not connected', () => {
      function fn() {
        gamepad.gamepadAxis('leftstickx', 1);
      }

      expect(fn).not.toThrow();
    });
  });

  // --------------------------------------------------
  // updateGamepad
  // --------------------------------------------------
  describe('updateGamepad', () => {
    it('should fire gamepaddown if button was pressed', () => {
      let spy = jest.fn();
      gamepad.onGamepad('south', spy);

      getGamepadsStub[0].buttons[0].pressed = true;
      gamepad.updateGamepad();

      expect(spy).toHaveBeenCalled();
    });

    it('should not fire gamepaddown if button was pressed already', () => {
      getGamepadsStub[0].buttons[0].pressed = true;
      gamepad.updateGamepad();

      let spy = jest.fn();
      gamepad.onGamepad('south', spy);

      getGamepadsStub[0].buttons[0].pressed = true;
      gamepad.updateGamepad();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should fire gamepadup if button was released', () => {
      getGamepadsStub[0].buttons[0].pressed = true;
      gamepad.updateGamepad();

      let spy = jest.fn();
      gamepad.onGamepad('south', spy, { handler: 'gamepadup' });

      getGamepadsStub[0].buttons[0].pressed = false;
      gamepad.updateGamepad();

      expect(spy).toHaveBeenCalled();
    });

    it('should not fire gamepadup if button was released already', () => {
      getGamepadsStub[0].buttons[0].pressed = false;
      gamepad.updateGamepad();

      let spy = jest.fn();
      gamepad.onGamepad('south', spy, { handler: 'gamepadup' });

      getGamepadsStub[0].buttons[0].pressed = false;
      gamepad.updateGamepad();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should set gamepad axes state', () => {
      getGamepadsStub[0].axes[0] = 1;
      getGamepadsStub[0].axes[1] = 2;
      getGamepadsStub[0].axes[2] = 3;
      getGamepadsStub[0].axes[3] = 4;
      gamepad.updateGamepad();

      expect(gamepad.gamepadAxis('leftstickx', 0)).toBe(1);
      expect(gamepad.gamepadAxis('leftsticky', 0)).toBe(2);
      expect(gamepad.gamepadAxis('rightstickx', 0)).toBe(3);
      expect(gamepad.gamepadAxis('rightsticky', 0)).toBe(4);
    });
  });
});
