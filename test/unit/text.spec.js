import Text, { TextClass } from '../../src/text.js';
import { _reset, init, getContext } from '../../src/core.js';

// test-context:start
let testContext = {
  TEXT_AUTONEWLINE: true,
  TEXT_NEWLINE: true,
  TEXT_RTL: true,
  TEXT_ALIGN: true,
  TEXT_STROKE: true
};
// test-context:end

// --------------------------------------------------
// text
// --------------------------------------------------
describe(
  'text with context: ' + JSON.stringify(testContext, null, 4),
  () => {
    it('should export class', () => {
      expect(typeof TextClass).toBe('function');
    });

    // --------------------------------------------------
    // init
    // --------------------------------------------------
    describe('init', () => {
      it('should set default properties', () => {
        let text = Text();

        expect(text.text).toBe('');
        expect(text.textAlign).toBe('');
        expect(text.lineHeight).toBe(1);
        expect(text.font).toBe(getContext().font);
      });

      it('should prerender the text and setup needed properties', () => {
        let text = Text({
          text: 'Hello',
          font: '32px Arial',
          color: 'black'
        });

        expect(text._s).toBeDefined();
        expect(text.width).toBeGreaterThan(0); // Canvas mock returns minimal width
        expect(text.height).toBe(32);
        expect(text.font).toBe('32px Arial');
        expect(text.text).toBe('Hello');
        expect(text.color).toBe('black');
      });

      it('should cast text to string', () => {
        let text = Text({
          text: 1
        });

        expect(text.text).toBe('1');
      });

      it('should set the text as dirty when setting font', () => {
        let text = Text({ text: '' });

        expect(text._d).toBe(false);

        text.font = '32px Arial';

        expect(text._d).toBe(true);
      });

      it('should set the text as dirty when setting text', () => {
        let text = Text({ text: '' });

        expect(text._d).toBe(false);

        text.text = 'Hello';

        expect(text._d).toBe(true);
      });

      it('should cast the value when setting text', () => {
        let text = Text({ text: '' });

        text.text = 123;

        expect(text.text).toBe('123');
      });

      it('should set the text as dirty when setting width', () => {
        let text = Text({ text: '' });

        expect(text._d).toBe(false);

        text.width = 100;

        expect(text._d).toBe(true);
      });

      it('should not call prerender if context is not set', () => {
        _reset();

        let text = Text({ text: '' });

        expect(text._s).toBeUndefined();
      });

      it('should set font if kontra.init is called after created', () => {
        _reset();

        let text = Text({ text: '' });

        expect(text.font).toBeUndefined();

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        let context = canvas.getContext('2d');
        context.font = '32px Arial';
        init(canvas);

        expect(text.font).toBe('32px Arial');
      });

      it('should not override font when set if kontra.init is called after created', () => {
        _reset();

        let text = Text({ text: '', font: '42px Arial' });

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        let context = canvas.getContext('2d');
        context.font = '32px Arial';
        init(canvas);

        expect(text.font).toBe('42px Arial');
      });

      it('should call prerender if kontra.init is called after created', () => {
        _reset();

        let text = Text({ text: '' });

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        init(canvas);

        expect(text._s).toBeDefined();
      });
    });

    // --------------------------------------------------
    // prerender
    // --------------------------------------------------
    describe('prerender', () => {
      it('should be called if a property was changed since the last render', () => {
        let text = Text({
          text: 'Hello',
          font: '32px Arial',
          color: 'black'
        });

        jest.spyOn(text, '_p').mockImplementation(() => {});

        text.render();

        expect(text._p).not.toHaveBeenCalled();

        text.text = 'Foo';

        text.render();

        expect(text._p).toHaveBeenCalled();
      });

      it('should calculate the width based on the size of the text and font', () => {
        let text = Text({
          text: 'Hello',
          font: '32px Arial',
          color: 'black'
        });
        text.context.font = text.font;
        let width = text.context.measureText(text.text).width;

        expect(text.width).toBe(width);
      });

      it('should calculate the height based on the font', () => {
        let text = Text({
          text: 'Hello',
          font: '32px Arial',
          color: 'black'
        });

        expect(text.height).toBe(32);
      });

      it('should not modify the fixed width of the text', () => {
        let text = Text({
          text: 'Hello There\nWorld',
          font: '32px Arial',
          width: 1000,
          color: 'black'
        });

        expect(text.width).toBe(1000);
      });

      if (testContext.TEXT_NEWLINE) {
        it('should calculate new lines', () => {
          let text = Text({
            text: 'Hello\nWorld',
            font: '32px Arial',
            color: 'black'
          });

          expect(text._s.length).toBe(2);
          expect(text._s).toEqual(['Hello', 'World']);
        });

        it('should calculate the width of a text with new lines as the width of the longest line', () => {
          let text = Text({
            text: 'Hello There\nWorld',
            font: '32px Arial',
            color: 'black'
          });
          text.context.font = text.font;
          let width = text.context.measureText('Hello There').width;

          expect(text.width).toBe(width);
        });

        it('should not modify the fixed width of the text (newlines)', () => {
          let text = Text({
            text: 'Hello There\nWorld',
            font: '32px Arial',
            width: 1000,
            color: 'black'
          });

          expect(text.width).toBe(1000);
        });

        it('should calculate the height based on the number of lines', () => {
          let text = Text({
            text: 'Hello\nWorld',
            font: '32px Arial',
            color: 'black'
          });

          expect(text.height).toBeGreaterThan(32);
        });
      } else {
        it('should not calculate new lines', () => {
          let text = Text({
            text: 'Hello\nWorld',
            font: '32px Arial',
            color: 'black'
          });

          expect(text._s.length).toBe(1);
        });
      }

      if (testContext.TEXT_AUTONEWLINE) {
        it('should calculate new lines when the width is set', () => {
          let text = Text({
            text: 'Hello World',
            font: '32px Arial',
            color: 'black',
            width: 50
          });

          expect(text._s.length).toBe(2);
          expect(text._s).toEqual(['Hello', 'World']);
        });

        it('should calculate the height based on the number of lines', () => {
          let text = Text({
            text: 'Hello World',
            font: '32px Arial',
            color: 'black',
            width: 50
          });

          expect(text.height).toBeGreaterThan(32);
        });

        if (testContext.TEXT_NEWLINE) {
          it('should calculate new lines and auto new lines', () => {
            let text = Text({
              text: 'Hello\nWorld,\nI must be going to see the\nsights',
              font: '32px Arial',
              color: 'black',
              width: 200
            });

            expect(text._s).toEqual([
              'Hello',
              'World,',
              'I must be',
              'going to see',
              'the',
              'sights'
            ]);
          });
        }
        else {
          it('should not calculate new lines and auto new lines', () => {
            let text = Text({
              text: 'Hello\nWorld,\nI must be going to see the\nsights',
              font: '32px Arial',
              color: 'black',
              width: 200
            });

            expect(text._s).toEqual([
              'Hello\nWorld,\nI',
              'must be',
              'going to see',
              'the\nsights'
            ]);
          });
        }
      } else {
        it('should not calculate auto new lines', () => {
          let text = Text({
            text: 'Hello World',
            font: '32px Arial',
            color: 'black',
            width: 50
          });

          expect(text._s.length).toBe(1);
        });
      }
    });

    // --------------------------------------------------
    // render
    // --------------------------------------------------
    describe('render', () => {
      it('should render the text', () => {
        let text = Text({
          text: 'Hello World',
          font: '32px Arial',
          color: 'black'
        });

        jest.spyOn(text.context, 'fillText');

        text.render(0, 0);

        expect(text.context.fillText).toHaveBeenCalled();
      });

      if (testContext.TEXT_ALIGN) {
        it('should respect textAlign property', () => {
          let text = Text({
            text: 'Hello World',
            font: '32px Arial',
            color: 'black',
            width: 1000
          });

          jest.spyOn(text.context, 'fillText');

          text.textAlign = 'center';
          text.render(0, 0);

          expect(text.context.fillText).toHaveBeenCalledWith(text.text, 500, 0);

          text.textAlign = 'right';
          text.render(0, 0);

          expect(text.context.fillText).toHaveBeenCalledWith(text.text, 1000, 0);
        });
      }

      if (testContext.TEXT_RTL) {
        it('should handle RTL languages', () => {
          let text = Text({
            text: 'Hello World',
            font: '32px Arial',
            color: 'black',
            width: 1000
          });

          jest.spyOn(text.context, 'fillText');

          text.context.canvas.dir = 'rtl';
          text.render(0, 0);

          expect(text.context.fillText).toHaveBeenCalledWith(text.text, 1000, 0);
        });
      }

      if (testContext.TEXT_AUTONEWLINE) {
        it('should render each line of the text', () => {
          let text = Text({
            text: 'Hello World',
            font: '32px Arial',
            color: 'black',
            width: 50
          });

          jest.spyOn(text.context, 'fillText');
          text.render(0, 0);

          expect(text.context.fillText).toHaveBeenCalledTimes(2);
          expect(text.context.fillText).toHaveBeenNthCalledWith(1, 'Hello', 0, 0);
          expect(text.context.fillText).toHaveBeenNthCalledWith(2, 'World', 0, 32);
        });

        it('should account for lineHeight', () => {
          let text = Text({
            text: 'Hello World',
            font: '32px Arial',
            color: 'black',
            width: 50,
            lineHeight: 2
          });

          jest.spyOn(text.context, 'fillText');
          text.render(0, 0);

          expect(text.context.fillText).toHaveBeenNthCalledWith(2, 'World', 0, 64);
        });
      }

      if (testContext.TEXT_NEWLINE) {
        it('should render each line of the text', () => {
          let text = Text({
            text: 'Hello\nWorld',
            font: '32px Arial',
            color: 'black'
          });

          jest.spyOn(text.context, 'fillText');
          text.render(0, 0);

          expect(text.context.fillText).toHaveBeenCalledTimes(2);
          expect(text.context.fillText).toHaveBeenNthCalledWith(1, 'Hello', 0, 0);
          expect(text.context.fillText).toHaveBeenNthCalledWith(2, 'World', 0, 32);
        });

        it('should account for lineHeight', () => {
          let text = Text({
            text: 'Hello\nWorld',
            font: '32px Arial',
            color: 'black',
            lineHeight: 2
          });

          jest.spyOn(text.context, 'fillText');
          text.render(0, 0);

          expect(text.context.fillText).toHaveBeenNthCalledWith(2, 'World', 0, 64);
        });
      }

      if (testContext.TEXT_STROKE) {
        it('should call strokeText', () => {
          let text = Text({
            text: 'Hello World',
            font: '32px Arial',
            color: 'black',
            strokeColor: 'white'
          });

          jest.spyOn(text.context, 'strokeText');

          text.render(0, 0);

          expect(text.context.strokeText).toHaveBeenCalled();
        });

        it('should use lineWidth', () => {
          let text = Text({
            text: 'Hello World',
            font: '32px Arial',
            color: 'black',
            strokeColor: 'white',
            lineWidth: 2
          });

          let setLineWidthSpy = jest.fn();
          Object.defineProperty(text.context, 'lineWidth', {
            set: setLineWidthSpy
          });

          text.render(0, 0);

          expect(setLineWidthSpy).toHaveBeenCalledWith(2);
        });
      }
      else {
        it('should not call strokeText', () => {
          let text = Text({
            text: 'Hello World',
            font: '32px Arial',
            color: 'black',
            strokeColor: 'white'
          });

          jest.spyOn(text.context, 'strokeText');

          text.render(0, 0);

          expect(text.context.strokeText).not.toHaveBeenCalled();
        });
      }
    });
  }
);
