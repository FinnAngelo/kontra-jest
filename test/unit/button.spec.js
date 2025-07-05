import Button, { ButtonClass } from '../../src/button.js';
import { TextClass } from '../../src/text.js';
import { initPointer, resetPointers } from '../../src/pointer.js';
import { srOnlyStyle } from '../../src/utils.js';
import { simulateEvent } from '../utils.js';

// --------------------------------------------------
// button
// --------------------------------------------------
describe('button', () => {
  let button;
  beforeEach(() => {
    initPointer();

    button = Button({
      text: {
        text: 'Hello'
      }
    });
  });

  afterEach(() => {
    button.destroy();
    resetPointers();
  });

  it('should export class', () => {
    expect(typeof ButtonClass).toBe('function');
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should set default properties', () => {
      button.destroy();
      button = Button();

      expect(button.padX).toBe(0);
      expect(button.padY).toBe(0);
      expect(button.textNode instanceof TextClass).toBe(true);
    });

    it('should setup text properties', () => {
      button.destroy();
      button = Button({
        text: {
          text: 'Hello',
          font: '32px Arial',
          width: 100,
          color: 'black'
        }
      });

      expect(button.textNode).toBeDefined();
      expect(button.textNode.width).toBe(100);
      expect(button.textNode.height).toBe(32);
      expect(button.textNode.font).toBe('32px Arial');
      expect(button.textNode.text).toBe('Hello');
      expect(button.textNode.color).toBe('black');
    });

    it('should start disabled if specified', () => {
      button.destroy();
      button = Button({
        disabled: true
      });

      expect(button.disabled).toBe(true);
    });

    it('should default width to the text size', () => {
      button.destroy();
      button = Button({
        text: {
          text: 'Hello',
          width: 100
        }
      });

      expect(button.width).toBe(100);
    });

    it('should set the button to the width if it is greater', () => {
      button.destroy();
      button = Button({
        width: 150,
        text: {
          text: 'Hello',
          width: 100
        }
      });

      expect(button.width).toBe(150);
    });

    it('should set the button to the text width if it is greater', () => {
      button.destroy();
      button = Button({
        width: 50,
        text: {
          text: 'Hello',
          width: 100
        }
      });

      expect(button.width).toBe(100);
    });

    it('should pass the context to the textNode', () => {
      let canvas = document.createElement('canvas');
      initPointer({ canvas });
      let context = canvas.getContext('2d');

      button.destroy();
      button = Button({
        context
      });

      expect(button.textNode.context).toBe(context);
    });

    it('should create a DOM node and add it to the page', () => {
      expect(button.node).toBeDefined();
      expect(button.node instanceof HTMLButtonElement).toBe(true);
      expect(button.node.textContent).toBe('Hello');
      expect(document.body.contains(button.node)).toBe(true);
    });

    it('should not allow setting the node', () => {
      expect(() => (button.node = 1)).toThrow();
      expect(button.node instanceof HTMLButtonElement).toBe(true);
    });

    it('should add the button as an immediate sibling to the canvas', () => {
      expect(button.context.canvas.nextSibling).toBe(button._dn);
    });

    it('should add the node to a container', () => {
      const container = document.createElement('div');
      button.destroy();
      button = Button({
        width: 150,
        text: {
          text: 'Hello',
          width: 100
        },
        container
      });

      expect(container.contains(button.node)).toBe(true);
    });

    it('should hide the DOM node', () => {
      let styles = srOnlyStyle
        .split(';')
        .map(style => style.split(':')[0].trim())
        .filter(style => !!style);
      button._dn
        .getAttribute('style')
        .split(';')
        .map(style => style.split(':')[0].trim())
        .filter(style => !!style)
        .forEach((prop, index) => {
          expect(styles[index]).toBe(prop);
        });
    });

    it('should setup focus event listeners on the DOM node', () => {
      jest.spyOn(button, 'focus');
      button._dn.focus();

      expect(button.focus).toHaveBeenCalled();
    });

    it('should setup blur event listeners on the DOM node', () => {
      jest.spyOn(button, 'blur');
      button._dn.focus();
      button._dn.blur();

      expect(button.blur).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // keyboard events
  // --------------------------------------------------
  describe('keyboard events', () => {
    // --------------------------------------------------
    // onDown
    // --------------------------------------------------
    describe('onDown', () => {
      it('should call onDown if Enter is pressed', () => {
        button.onDown = jest.fn();
        simulateEvent('keydown', { code: 'Enter' }, button._dn);

        expect(button.onDown).toHaveBeenCalled();
      });

      it('should call onDown if Space is pressed', () => {
        button.onDown = jest.fn();
        simulateEvent('keydown', { code: 'Space' }, button._dn);

        expect(button.onDown).toHaveBeenCalled();
      });

      it('should not call onDown if any other key is pressed', () => {
        button.onDown = jest.fn();
        simulateEvent('keydown', { code: 'KeyA' }, button._dn);

        expect(button.onDown).not.toHaveBeenCalled();
      });
    });

    // --------------------------------------------------
    // onUp
    // --------------------------------------------------
    describe('onUp', () => {
      it('should call onUp if Enter is pressed', () => {
        button.onUp = jest.fn();
        simulateEvent('keyup', { code: 'Enter' }, button._dn);

        expect(button.onUp).toHaveBeenCalled();
      });

      it('should call onUp if Space is pressed', () => {
        button.onUp = jest.fn();
        simulateEvent('keyup', { code: 'Space' }, button._dn);

        expect(button.onUp).toHaveBeenCalled();
      });

      it('should not call onUp if any other key is pressed', () => {
        button.onUp = jest.fn();
        simulateEvent('keyup', { code: 'KeyA' }, button._dn);

        expect(button.onUp).not.toHaveBeenCalled();
      });
    });
  });

  // --------------------------------------------------
  // text
  // --------------------------------------------------
  describe('text', () => {
    it('should return the text of the textNode', () => {
      expect(button.text).toBe('Hello');
    });

    it('should set the text of the textNode', () => {
      button.text = 'my text';

      expect(button.textNode.text).toBe('my text');
    });
  });

  // --------------------------------------------------
  // destroy
  // --------------------------------------------------
  describe('destroy', () => {
    it('should remove the DOM node', () => {
      button.destroy();

      expect(document.body.contains(button._dn)).toBe(false);
    });
  });

  // --------------------------------------------------
  // prerender
  // --------------------------------------------------
  describe('prerender', () => {
    it('should be called if a property was changed since the last render', () => {
      button._p = jest.fn();

      button.render();

      expect(button._p).not.toHaveBeenCalled();

      button.text = 'Foo';

      button.render();

      expect(button._p).toHaveBeenCalled();
    });

    it('should update the DOM node text if the button text has changed', () => {
      button.text = 'World!';
      button.render();

      expect(button.text).toBe('World!');
    });

    it('should update the width and height of the button if the text changes', () => {
      const initialWidth = button.width;

      button.textNode.font = '32px Arial';
      button.text = 'Hello World!';
      button.render();

      expect(button.width).toBeGreaterThan(initialWidth);
      expect(button.height).toBe(32);
    });

    it('should not update the wdith and height of the button if the button width is great', () => {
      button.width = 300;
      button.height = 300;

      button.textNode.font = '32px Arial';
      button.text = 'Hello World!';
      button.render();

      expect(button.width).toBe(300);
      expect(button.height).toBe(300);
    });
  });

  // --------------------------------------------------
  // focus
  // --------------------------------------------------
  describe('focus', () => {
    it('should set the focused property', () => {
      button.focused = false;
      button.focus();

      expect(button.focused).toBe(true);
    });

    it('should call onFocus', () => {
      button.onFocus = jest.fn();
      button.focus();

      expect(button.onFocus).toHaveBeenCalled();
    });

    it('should focus the DOM node', () => {
      jest.spyOn(button._dn, 'focus');
      button.focus();

      expect(button._dn.focus).toHaveBeenCalledWith({ preventScroll: true });
    });

    it('should not focus the DOM node if it is already focused', () => {
      button._dn.focus();
      const focusSpy = jest.spyOn(button._dn, 'focus');
      button.focus();

      expect(focusSpy).not.toHaveBeenCalled();
    });

    it('should not focus if button is disabled', () => {
      button.focused = false;
      button.disabled = true;
      button.onFocus = jest.fn();
      button.focus();

      expect(button.focused).toBe(false);
      expect(button.onFocus).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // blur
  // --------------------------------------------------
  describe('blur', () => {
    beforeEach(() => {
      button.focus();
    });

    it('should unset the focused property', () => {
      button.focused = true;
      button.blur();

      expect(button.focused).toBe(false);
    });

    it('should call onBlur', () => {
      button.onBlur = jest.fn();
      button.blur();

      expect(button.onBlur).toHaveBeenCalled();
    });

    it('should blur the DOM node', () => {
      button._dn.focus();
      const blurSpy = jest.spyOn(button._dn, 'blur');
      button.blur();

      expect(blurSpy).toHaveBeenCalled();
    });

    it('should not blur the DOM node if it is already blurred', () => {
      button._dn.blur();
      const blurSpy = jest.spyOn(button._dn, 'blur');
      button.blur();

      expect(blurSpy).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // enable
  // --------------------------------------------------
  describe('enable', () => {
    it('should unset the disabled property', () => {
      button.disabled = true;
      button.enable();

      expect(button.disabled).toBe(false);
    });

    it('should unset the DOM nodes disable property', () => {
      button.enable();

      expect(button._dn.disabled).toBe(false);
    });

    it('should call onEnable', () => {
      button.onEnable = jest.fn();
      button.enable();

      expect(button.onEnable).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // disable
  // --------------------------------------------------
  describe('disable', () => {
    it('should set the disabled property', () => {
      button.disabled = false;
      button.disable();

      expect(button.disabled).toBe(true);
    });

    it('should set the DOM nodes disable property', () => {
      button.disable();

      expect(button._dn.disabled).toBe(true);
    });

    it('should call onDisable', () => {
      button.onDisable = jest.fn();
      button.disable();

      expect(button.onDisable).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // onOver
  // --------------------------------------------------
  describe('onOver', () => {
    it('should set the hovered property', () => {
      button.hovered = false;
      button.onOver();

      expect(button.hovered).toBe(true);
    });

    it('should not hover if button is disabled', () => {
      button.hovered = false;
      button.disabled = true;
      button.onOver();

      expect(button.hovered).toBe(false);
    });
  });

  // --------------------------------------------------
  // onOut
  // --------------------------------------------------
  describe('onOut', () => {
    it('should unset the hovered property', () => {
      button.hovered = true;
      button.onOut();

      expect(button.hovered).toBe(false);
    });
  });

  // --------------------------------------------------
  // onDown
  // --------------------------------------------------
  describe('onDown', () => {
    it('should set the pressed property', () => {
      button.pressed = false;
      button.onDown();

      expect(button.pressed).toBe(true);
    });

    it('should call onDown if passed', () => {
      let spy = jest.fn();

      button = new Button({
        text: {
          text: 'Hello'
        },
        onDown: spy
      });
      button.onDown();

      expect(spy).toHaveBeenCalled();
    });

    it('should not press if button is disabled', () => {
      button.pressed = false;
      button.disabled = true;
      button.onDown();

      expect(button.pressed).toBe(false);
    });
  });

  // --------------------------------------------------
  // onUp
  // --------------------------------------------------
  describe('onUp', () => {
    it('should unset the pressed property', () => {
      button.pressed = true;
      button.onUp();

      expect(button.pressed).toBe(false);
    });

    it('should call onUp if passed', () => {
      let spy = jest.fn();

      button = new Button({
        text: {
          text: 'Hello'
        },
        onUp: spy
      });
      button.onUp();

      expect(spy).toHaveBeenCalled();
    });

    it('should not press if button is disabled', () => {
      button.pressed = true;
      button.disabled = true;
      button.onUp();

      expect(button.pressed).toBe(true);
    });
  });
});
