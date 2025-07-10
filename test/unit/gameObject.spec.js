import GameObject, { GameObjectClass } from '../../src/gameObject.js';
import { _reset, init, getContext } from '../../src/core.js';
import { noop } from '../../src/utils.js';
import { degToRad } from '../../src/helpers.js';
import Vector from '../../src/vector.js';

// test-context:start
let testContext = {
  GAMEOBJECT_ANCHOR: true,
  GAMEOBJECT_GROUP: true,
  GAMEOBJECT_OPACITY: true,
  GAMEOBJECT_RADIUS: true,
  GAMEOBJECT_ROTATION: true,
  GAMEOBJECT_SCALE: true,
  GAMEOBJECT_VELOCITY: true,
  GAMEOBJECT_ACCELERATION: true
};
// test-context:end

// --------------------------------------------------
// gameObject
// --------------------------------------------------
describe(
  'gameObject with context: ' + JSON.stringify(testContext, null, 4),
  () => {
    let spy, gameObject;
    beforeEach(() => {
      gameObject = GameObject();
    });

    it('should export class', () => {
      expect(typeof GameObjectClass).toBe('function');
    });

    // --------------------------------------------------
    // init
    // --------------------------------------------------
    describe('init', () => {
      it('should set default properties', () => {
        expect(gameObject.context).toBe(getContext());
        expect(gameObject.width).toBe(0);
        expect(gameObject.height).toBe(0);
      });

      it('should set width and height properties', () => {
        gameObject = GameObject({ width: 10, height: 20 });

        expect(gameObject.width).toBe(10);
        expect(gameObject.height).toBe(20);
      });

      it('should set context property', () => {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        gameObject = GameObject({ context });

        expect(gameObject.context).toBe(context);
      });

      it('should set any property', () => {
        gameObject = GameObject({ myProp: 'foo' });

        expect(gameObject.myProp).toBe('foo');
      });

      it('should set render function', () => {
        gameObject = GameObject({ render: noop });

        expect(gameObject._rf).toBe(noop);
      });

      it('should not override properties from parent object', () => {
        class MyClass extends GameObjectClass {
          init() {
            super.init({
              width: 20,
              height: 30
            });
          }
        }

        let obj = new MyClass();
        expect(obj.width).toBe(20);
        expect(obj.height).toBe(30);
      });

      it('should set context if kontra.init is called after created', () => {
        _reset();

        gameObject = GameObject();

        expect(gameObject.context).toBeUndefined();

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        init(canvas);

        expect(gameObject.context).toBe(canvas.getContext('2d'));
      });

      it('should not override context when set if kontra.init is called after created', () => {
        _reset();

        gameObject = GameObject({ context: true });

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        init(canvas);

        expect(gameObject.context).toBe(true);
      });

      if (testContext.GAMEOBJECT_ANCHOR) {
        it('should set default anchor', () => {
          expect(gameObject.anchor).toEqual({ x: 0, y: 0 });
        });

        it('should set anchor property', () => {
          gameObject = GameObject({ anchor: { x: 0.5, y: 0.5 } });

          expect(gameObject.anchor).toEqual({ x: 0.5, y: 0.5 });
        });
      } else {
        it('should not default anchor', () => {
          expect(gameObject.anchor).toBeUndefined();
        });
      }

      if (testContext.GAMEOBJECT_GROUP) {
        it('should set default children', () => {
          expect(gameObject.children).toEqual([]);
        });

        it('should set children property', () => {
          gameObject = GameObject({
            children: [GameObject(), GameObject()]
          });

          expect(gameObject.children).toHaveLength(2);
        });

        it('should call "addChild" for each child', () => {
          spy = jest
            .spyOn(GameObjectClass.prototype, 'addChild')
            .mockImplementation(noop);

          gameObject = GameObject({ children: ['child1', 'child2'] });

          expect(spy).toHaveBeenCalledWith(['child1', 'child2']);
        });
      } else {
        it('should not default children', () => {
          expect(gameObject.children).toBeUndefined();
        });
      }

      if (testContext.GAMEOBJECT_OPACITY) {
        it('should set default opacity', () => {
          expect(gameObject.opacity).toBe(1);
        });

        it('should set opacity property', () => {
          gameObject = GameObject({ opacity: 0.5 });

          expect(gameObject.opacity).toBe(0.5);
        });

        it('should clamp opacity between 0 and 1', () => {
          gameObject = GameObject({ opacity: -10 });

          expect(gameObject.opacity).toBe(0);

          gameObject.opacity = 10;

          expect(gameObject.opacity).toBe(1);
        });
      } else {
        it('should not default opacity', () => {
          expect(gameObject.opacity).toBeUndefined();
        });
      }

      if (testContext.GAMEOBJECT_RADIUS) {
        it('should set default radius', () => {
          expect(gameObject.radius).toBe(undefined);
        });

        it('should set radius property', () => {
          gameObject = GameObject({ radius: 0.5 });

          expect(gameObject.radius).toBe(0.5);
        });
      } else {
        it('should not default radius', () => {
          expect(gameObject.radius).toBeUndefined();
        });
      }

      if (testContext.GAMEOBJECT_ROTATION) {
        it('should set default rotation', () => {
          expect(gameObject.rotation).toBe(0);
        });

        it('should set rotation property', () => {
          gameObject = GameObject({ rotation: 0.5 });

          expect(gameObject.rotation).toBe(0.5);
        });
      } else {
        it('should not default rotation', () => {
          expect(gameObject.rotation).toBeUndefined();
        });
      }

      if (
        testContext.GAMEOBJECT_ROTATION &&
        testContext.GAMEOBJECT_VELOCITY
      ) {
        test('should set default drotation', () => {
          expect(gameObject.drotation).toBe(0);
        });

        test('should set drotation property', () => {
          gameObject = GameObject({ drotation: 0.5 });

          expect(gameObject.drotation).toBe(0.5);
        });
      } else {
        test('should not default drotation', () => {
          expect(gameObject.drotation).toBeUndefined();
        });
      }

      if (
        testContext.GAMEOBJECT_ROTATION &&
        testContext.GAMEOBJECT_ACCELERATION
      ) {
        test('should set default ddrotation', () => {
          expect(gameObject.ddrotation).toBe(0);
        });

        test('should set ddrotation property', () => {
          gameObject = GameObject({ ddrotation: 0.5 });

          expect(gameObject.ddrotation).toBe(0.5);
        });
      } else {
        test('should not default ddrotation', () => {
          expect(gameObject.ddrotation).toBeUndefined();
        });
      }

      if (testContext.GAMEOBJECT_SCALE) {
        test('should set default scale', () => {
          expect(gameObject.scaleX).toBe(1);
          expect(gameObject.scaleY).toBe(1);
        });

        test('should set scaleX and scaleY properties', () => {
          gameObject = GameObject({ scaleX: 10, scaleY: 20 });

          expect(gameObject.scaleX).toBe(10);
          expect(gameObject.scaleY).toBe(20);
        });
      } else {
        test('should not default scale', () => {
          expect(gameObject.scaleX).toBeUndefined();
          expect(gameObject.scaleY).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // render
    // --------------------------------------------------
    describe('render', () => {
      test('should translate to the x and y position', () => {
        gameObject.x = 10;
        gameObject.y = 20;

        const translateSpy = jest.spyOn(gameObject.context, 'translate').mockImplementation(noop);

        gameObject.render();

        expect(translateSpy).toHaveBeenCalledWith(10, 20);
      });

      test('should not translate if the position is 0', () => {
        const translateSpy = jest.spyOn(gameObject.context, 'translate').mockImplementation(noop);

        gameObject.render();

        expect(translateSpy).not.toHaveBeenCalled();
      });

      if (testContext.GAMEOBJECT_ROTATION) {
        test('should rotate by the rotation', () => {
          gameObject.rotation = 10;

          const rotateSpy = jest.spyOn(gameObject.context, 'rotate').mockImplementation(noop);

          gameObject.render();

          expect(rotateSpy).toHaveBeenCalledWith(10);
        });

        test('should not rotate if the rotation is 0', () => {
          const rotateSpy = jest.spyOn(gameObject.context, 'rotate').mockImplementation(noop);

          gameObject.render();

          expect(rotateSpy).not.toHaveBeenCalled();
        });
      } else {
        test('should not rotate', () => {
          gameObject.rotation = 10;

          const rotateSpy = jest.spyOn(gameObject.context, 'rotate').mockImplementation(noop);

          gameObject.render();

          expect(rotateSpy).not.toHaveBeenCalled();
        });
      }

      if (testContext.GAMEOBJECT_SCALE) {
        test('should scale the canvas', () => {
          gameObject.scaleX = 2;
          gameObject.scaleY = 2;

          const scaleSpy = jest.spyOn(gameObject.context, 'scale').mockImplementation(noop);

          gameObject.render();

          expect(scaleSpy).toHaveBeenCalledWith(2, 2);
        });

        test('should not scale if scaleX and scaleY are 1', () => {
          const scaleSpy = jest.spyOn(gameObject.context, 'scale').mockImplementation(noop);

          gameObject.render();

          expect(scaleSpy).not.toHaveBeenCalled();
        });
      } else {
        test('should not scale', () => {
          gameObject.scaleX = 2;
          gameObject.scaleY = 2;

          const scaleSpy = jest.spyOn(gameObject.context, 'scale').mockImplementation(noop);

          gameObject.render();

          expect(scaleSpy).not.toHaveBeenCalled();
        });
      }

      if (testContext.GAMEOBJECT_ANCHOR) {
        test('should translate to the anchor position (square)', () => {
          gameObject.anchor = { x: 0.5, y: 0.5 };
          gameObject.width = 20;
          gameObject.height = 30;

          const translateSpy = jest.spyOn(gameObject.context, 'translate').mockImplementation(noop);

          gameObject.render();

          expect(translateSpy).toHaveBeenNthCalledWith(1, -10, -15);
        });

        if (testContext.GAMEOBJECT_RADIUS) {
          test('should translate to the anchor position (circle)', () => {
            gameObject.anchor = { x: 0.5, y: 0.5 };
            gameObject.radius = 10;

            const translateSpy = jest.spyOn(gameObject.context, 'translate').mockImplementation(noop);

            gameObject.render();

            expect(translateSpy).toHaveBeenNthCalledWith(1, -10, -10);
          });
        } else {
          test('should not translate to the anchor position (circle)', () => {
            gameObject.anchor = { x: 0.5, y: 0.5 };
            gameObject.radius = 10;

            const translateSpy = jest.spyOn(gameObject.context, 'translate').mockImplementation(noop);

            gameObject.render();

            expect(translateSpy).not.toHaveBeenCalled();
          });
        }

        test('should not translate if the anchor position is {0, 0}', () => {
          const translateSpy = jest.spyOn(gameObject.context, 'translate').mockImplementation(noop);

          gameObject.render();

          expect(translateSpy).not.toHaveBeenCalled();
        });

        test('should translate back to the x/y position', () => {
          gameObject.anchor = { x: 0.5, y: 0.5 };
          gameObject.width = 20;
          gameObject.height = 30;

          const translateSpy = jest.spyOn(gameObject.context, 'translate').mockImplementation(noop);

          gameObject.render();

          expect(translateSpy).toHaveBeenNthCalledWith(2, 10, 15);
        });
      } else {
        test('should not translate by anchor', () => {
          gameObject.anchor = { x: 0.5, y: 0.5 };
          gameObject.width = 20;
          gameObject.height = 30;

          const translateSpy = jest.spyOn(gameObject.context, 'translate').mockImplementation(noop);

          gameObject.render();

          expect(translateSpy).not.toHaveBeenCalled();
        });
      }

      if (testContext.GAMEOBJECT_OPACITY) {
        test('should set the globalAlpha', () => {
          gameObject.opacity = 0.5;

          // Create a mock to track globalAlpha setting
          const originalDescriptor = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'globalAlpha');
          const setGlobalAlphaSpy = jest.fn();
          Object.defineProperty(CanvasRenderingContext2D.prototype, 'globalAlpha', {
            set: setGlobalAlphaSpy,
            get: originalDescriptor?.get || (() => 1),
            configurable: true
          });

          gameObject.render();

          expect(setGlobalAlphaSpy).toHaveBeenCalledWith(0.5);

          // Restore original descriptor
          if (originalDescriptor) {
            Object.defineProperty(CanvasRenderingContext2D.prototype, 'globalAlpha', originalDescriptor);
          }
        });
      } else {
        test('should not set the globalAlpha', () => {
          gameObject.opacity = 0.5;

          // Create a mock to track globalAlpha setting
          const originalDescriptor = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'globalAlpha');
          const setGlobalAlphaSpy = jest.fn();
          Object.defineProperty(CanvasRenderingContext2D.prototype, 'globalAlpha', {
            set: setGlobalAlphaSpy,
            get: originalDescriptor?.get || (() => 1),
            configurable: true
          });

          gameObject.render();

          expect(setGlobalAlphaSpy).not.toHaveBeenCalled();

          // Restore original descriptor
          if (originalDescriptor) {
            Object.defineProperty(CanvasRenderingContext2D.prototype, 'globalAlpha', originalDescriptor);
          }
        });
      }

      test('should call the default render function', () => {
        spy = jest.spyOn(GameObjectClass.prototype, 'draw').mockImplementation(noop);

        // redeclare now that the spy is set
        gameObject = GameObject();
        gameObject.render();

        expect(spy).toHaveBeenCalled();
      });

      test('should call a custom render function', () => {
        spy = jest.fn();
        let gameObject = GameObject({
          render: spy
        });

        gameObject.render();

        expect(spy).toHaveBeenCalled();
      });

      if (testContext.GAMEOBJECT_GROUP) {
        test('should call render on each child', () => {
          let child = {
            render: jest.fn()
          };

          gameObject.children = [child];

          gameObject.render();

          expect(child.render).toHaveBeenCalled();
        });
      } else {
        test('should not call render on each child', () => {
          let child = {
            render: jest.fn()
          };

          gameObject.children = [child];

          gameObject.render();

          expect(child.render).not.toHaveBeenCalled();
        });
      }
    });

    // --------------------------------------------------
    // world
    // --------------------------------------------------
    describe('world', () => {
      test('should default position and size properties', () => {
        expect(gameObject.world.x).toBe(0);
        expect(gameObject.world.y).toBe(0);
        expect(gameObject.world.width).toBe(0);
        expect(gameObject.world.height).toBe(0);
      });

      test('should update position', () => {
        gameObject.x = 10;
        gameObject.y = 20;

        expect(gameObject.world.x).toBe(10);
        expect(gameObject.world.y).toBe(20);
      });

      test('should update size', () => {
        gameObject.width = 10;
        gameObject.height = 20;

        expect(gameObject.world.width).toBe(10);
        expect(gameObject.world.height).toBe(20);
      });

      if (testContext.GAMEOBJECT_OPACITY) {
        it('should default opacity', () => {
          expect(gameObject.world.opacity).toBe(1);
        });

        it('should update world opacity', () => {
          gameObject.opacity = 0.5;

          expect(gameObject.world.opacity).toBe(0.5);
        });
      } else {
        it('should not have opacity', () => {
          expect(gameObject.world.opacity).toBeUndefined();
        });
      }

      if (testContext.GAMEOBJECT_RADIUS) {
        it('should have radius', () => {
          gameObject.radius = 10;
          expect(gameObject.world.radius).toEqual({
            x: 10,
            y: 10
          });
        });

        it('should not have radius if not set', () => {
          expect(gameObject.world.radius).toBeUndefined();
        });

        it('should update world radius', () => {
          gameObject.radius = 0.5;

          expect(gameObject.world.radius).toEqual({
            x: 0.5,
            y: 0.5
          });
        });
      } else {
        it('should not have radius', () => {
          expect(gameObject.world.radius).toBeUndefined();
        });
      }

      if (testContext.GAMEOBJECT_ROTATION) {
        it('should default rotation', () => {
          expect(gameObject.world.rotation).toBe(0);
        });

        it('should update world rotation', () => {
          gameObject.rotation = 0.5;

          expect(gameObject.world.rotation).toBe(0.5);
        });
      } else {
        it('should not have rotation', () => {
          expect(gameObject.world.rotation).toBeUndefined();
        });
      }

      if (testContext.GAMEOBJECT_SCALE) {
        it('should default scale', () => {
          expect(gameObject.world.scaleX).toBe(1);
          expect(gameObject.world.scaleY).toBe(1);
        });

        it('should update world scale', () => {
          gameObject.scaleX = 2;
          gameObject.scaleY = 3;

          expect(gameObject.world.scaleX).toBe(2);
          expect(gameObject.world.scaleY).toBe(3);
        });

        it('should update size based on scale', () => {
          gameObject.width = 10;
          gameObject.height = 20;

          gameObject.scaleX = 2;
          gameObject.scaleY = 2;

          expect(gameObject.world.width).toBe(20);
          expect(gameObject.world.height).toBe(40);
        });

        if (testContext.GAMEOBJECT_RADIUS) {
          it('should update radius based on scale', () => {
            gameObject.radius = 10;
            gameObject.scaleX = 2;
            gameObject.scaleY = 3;

            expect(gameObject.world.radius).toEqual({
              x: 20,
              y: 30
            });
          });
        }
      } else {
        it('should not have scale', () => {
          expect(gameObject.world.scaleX).toBeUndefined();
          expect(gameObject.world.scaleY).toBeUndefined();
        });

        it('should not update size based on scale', () => {
          gameObject.width = 10;
          gameObject.height = 20;

          gameObject.scaleX = 2;
          gameObject.scaleY = 2;

          expect(gameObject.world.width).toBe(10);
          expect(gameObject.world.height).toBe(20);
        });
      }

      if (testContext.GAMEOBJECT_GROUP) {
        it('should update world of each child', () => {
          let parent = GameObject({
            children: [gameObject]
          });

          parent.x = 10;
          parent.y = 20;

          expect(gameObject.world.x).toBe(10);
          expect(gameObject.world.y).toBe(20);
        });

        if (testContext.GAMEOBJECT_OPACITY) {
          it('should update opacity based on parent', () => {
            GameObject({
              opacity: 0.5,
              children: [gameObject]
            });

            gameObject.opacity = 0.5;

            expect(gameObject.world.opacity).toBe(0.25);
          });
        }

        if (testContext.GAMEOBJECT_ROTATION) {
          it('should update rotation based on parent', () => {
            GameObject({
              rotation: 10,
              children: [gameObject]
            });

            gameObject.rotation = 20;

            expect(gameObject.world.rotation).toBe(30);
          });
        }

        if (testContext.GAMEOBJECT_SCALE) {
          it('should update scale based on parent', () => {
            GameObject({
              scaleX: 2,
              scaleY: 2,
              children: [gameObject]
            });

            gameObject.scaleX = 2;
            gameObject.scaleY = 3;

            expect(gameObject.world.scaleX).toBe(4);
            expect(gameObject.world.scaleY).toBe(6);
          });

          it('should update position based on parent scale', () => {
            GameObject({
              scaleX: 2,
              scaleY: 2,
              children: [gameObject]
            });

            gameObject.x = 10;
            gameObject.y = 20;

            expect(gameObject.world.x).toBe(20);
            expect(gameObject.world.y).toBe(40);
          });

          it('should update size based on all scales', () => {
            GameObject({
              scaleX: 2,
              scaleY: 2,
              children: [gameObject]
            });

            gameObject.width = 10;
            gameObject.height = 20;
            gameObject.scaleX = 3;
            gameObject.scaleY = 3;

            expect(gameObject.world.width).toBe(60);
            expect(gameObject.world.height).toBe(120);
          });

          if (testContext.GAMEOBJECT_RADIUS) {
            it('should update radius based on all scales', () => {
              GameObject({
                scaleX: 2,
                scaleY: 2,
                children: [gameObject]
              });

              gameObject.radius = 10;
              gameObject.scaleX = 3;
              gameObject.scaleY = 4;

              expect(gameObject.world.radius).toEqual({
                x: 60,
                y: 80
              });
            });
          }
        }

        if (
          testContext.GAMEOBJECT_ANCHOR &&
          testContext.GAMEOBJECT_ROTATION &&
          testContext.GAMEOBJECT_SCALE
        ) {
          it('should work with complex example', () => {
            let parent = GameObject({
              x: 100,
              y: 100,
              width: 20,
              height: 20
            });

            let child = GameObject({
              x: 0,
              y: 0,
              width: 20,
              height: 20,
              rotation: degToRad(45)
            });

            let grandchild = GameObject({
              x: 25,
              y: -50,
              width: 20,
              height: 20,
              scaleX: 1.5,
              scaleY: 9,
              rotation: degToRad(25)
            });

            let greatGrandchild = GameObject({
              x: 0,
              y: -10,
              width: 20,
              height: 20
            });

            parent.children = [child];
            child.children = [grandchild];
            grandchild.children = [greatGrandchild];

            expect(parent.world.x).toBe(100);
            expect(parent.world.y).toBe(100);
            expect(parent.world.width).toBe(20);
            expect(parent.world.height).toBe(20);
            expect(parent.world.rotation).toBe(0);

            expect(child.world.x).toBe(100);
            expect(child.world.y).toBe(100);
            expect(child.world.width).toBe(20);
            expect(child.world.height).toBe(20);
            expect(child.world.rotation).toBe(degToRad(45));

            expect(grandchild.world.x).toBe(153.03300858899107);
            expect(grandchild.world.y).toBe(82.32233047033631);
            expect(grandchild.world.width).toBe(30);
            expect(grandchild.world.height).toBe(180);
            expect(grandchild.world.rotation).toBe(degToRad(70));

            expect(greatGrandchild.world.x).toBe(
              237.6053444597228
            );
            expect(greatGrandchild.world.y).toBe(
              51.540517571026115
            );
            expect(greatGrandchild.world.width).toBe(30);
            expect(greatGrandchild.world.height).toBe(180);
            expect(greatGrandchild.world.rotation).toBe(
              degToRad(70)
            );
          });
        }
      }
    });

    // --------------------------------------------------
    // advance
    // --------------------------------------------------
    describe('advance', () => {
      if (
        (testContext.GAMEOBJECT_ROTATION &&
          testContext.GAMEOBJECT_VELOCITY) ||
        testContext.GAMEOBJECT_ACCELERATION
      ) {
        it('should call parent advance', () => {
          gameObject.position = Vector(5, 10);
          gameObject.velocity = Vector(15, 20);

          gameObject.advance();

          expect(gameObject.position.x).toBe(20);
          expect(gameObject.position.y).toBe(30);
        });
      }

      if (
        testContext.GAMEOBJECT_ROTATION &&
        testContext.GAMEOBJECT_VELOCITY &&
        testContext.GAMEOBJECT_ACCELERATION
      ) {
        it('should add the angular acceleration to the angular velocity', () => {
          gameObject.drotation = 0.5;
          gameObject.ddrotation = 0.5;

          gameObject.advance();

          expect(gameObject.drotation).toBe(1);
        });
      }

      if (
        testContext.GAMEOBJECT_ROTATION &&
        testContext.GAMEOBJECT_VELOCITY
      ) {
        it('should add the angular velocity to the rotation', () => {
          gameObject.rotation = 0.5;
          gameObject.drotation = 0.5;

          gameObject.advance();

          expect(gameObject.rotation).toBe(1);
        });
      } else {
        it('should not modify the rotation', () => {
          gameObject.rotation = 0;
          gameObject.drotation = 0.5;
          gameObject.ddrotation = 0.5;

          gameObject.advance();

          expect(gameObject.rotation).toBe(0);
        });
      }
    });

    // --------------------------------------------------
    // group
    // --------------------------------------------------
    describe('group', () => {
      // --------------------------------------------------
      // addChild
      // --------------------------------------------------
      describe('addChild', () => {
        if (testContext.GAMEOBJECT_GROUP) {
          it('should add the object as a child', () => {
            let child = {
              foo: 'bar'
            };
            gameObject.addChild(child);

            expect(gameObject.children).toEqual([child]);
          });

          it('should add multiple objects as a child', () => {
            let child1 = {
              foo: 'bar'
            };
            let child2 = {};
            gameObject.addChild(child1, child2);

            expect(gameObject.children).toEqual([child1, child2]);
          });

          it('should add an array objects as a child', () => {
            let child1 = {
              foo: 'bar'
            };
            let child2 = {};
            gameObject.addChild([child1, child2]);

            expect(gameObject.children).toEqual([child1, child2]);
          });

          it('should set the childs parent to the game object', () => {
            let child = {
              foo: 'bar'
            };
            gameObject.addChild(child);

            expect(child.parent).toBe(gameObject);
          });

          it('should update the world property', () => {
            let child = GameObject({
              x: 10,
              y: 20
            });
            gameObject.x = 30;
            gameObject.y = 40;
            gameObject.addChild(child);

            expect(child.world.x).toBe(40);
            expect(child.world.y).toBe(60);
          });
        } else {
          it('should not have addChild', () => {
            expect(gameObject.addChild).toBeUndefined();
          });
        }
      });

      // --------------------------------------------------
      // removeChild
      // --------------------------------------------------
      describe('removeChild', () => {
        if (testContext.GAMEOBJECT_GROUP) {
          it('should remove the object as a child', () => {
            let child = {
              foo: 'bar'
            };
            gameObject.addChild(child);
            gameObject.removeChild(child);

            expect(gameObject.children.length).toBe(0);
          });

          it('should add multiple objects as a child', () => {
            let child1 = {
              foo: 'bar'
            };
            let child2 = {};
            gameObject.addChild(child1, child2);
            gameObject.removeChild(child1, child2);

            expect(gameObject.children).toEqual([]);
          });

          it('should add an array objects as a child', () => {
            let child1 = {
              foo: 'bar'
            };
            let child2 = {};
            gameObject.addChild(child1, child2);
            gameObject.removeChild([child1, child2]);

            expect(gameObject.children).toEqual([]);
          });

          it('should remove the childs parent', () => {
            let child = {
              foo: 'bar'
            };
            gameObject.addChild(child);
            gameObject.removeChild(child);

            expect(child.parent).toBe(null);
          });

          it('should not error if child was not added', () => {
            let child = {
              foo: 'bar'
            };

            function fn() {
              gameObject.removeChild(child);
            }

            expect(fn).not.toThrow();
          });

          it('should update the world property', () => {
            let child = GameObject({
              x: 10,
              y: 20
            });
            gameObject.x = 30;
            gameObject.y = 40;
            gameObject.addChild(child);
            gameObject.removeChild(child);

            expect(child.world.x).toBe(10);
            expect(child.world.y).toBe(20);
          });
        } else {
          it('should not have removeChild', () => {
            expect(gameObject.removeChild).toBeUndefined();
          });
        }
      });

      // --------------------------------------------------
      // children
      // --------------------------------------------------
      describe('children', () => {
        if (testContext.GAMEOBJECT_GROUP) {
          it('should properly handle setting children', () => {
            gameObject.addChild({ foo: 'bar' });
            gameObject.addChild({ faz: 'baz' });
            gameObject.addChild({ hello: 'world' });

            let removeSpy = jest.spyOn(gameObject, 'removeChild');
            let addSpy = jest.spyOn(gameObject, 'addChild');
            let child = {
              thing1: 'thing2'
            };

            let oldChildren = gameObject.children;
            gameObject.children = [child];

            expect(removeSpy).toHaveBeenCalledWith(oldChildren);
            expect(addSpy).toHaveBeenCalledWith([child]);
            expect(gameObject.children.length).toBe(1);
            expect(gameObject.children[0]).toBe(child);
          });
        } else {
          it('should not have children', () => {
            expect(gameObject.children).toBeUndefined();
          });
        }
      });

      // --------------------------------------------------
      // update
      // --------------------------------------------------
      describe('update', () => {
        it('should call the default update function', () => {
          spy = jest.spyOn(GameObjectClass.prototype, 'advance');

          // redeclare now that the spy is set
          gameObject = GameObject();
          gameObject.update();

          expect(spy).toHaveBeenCalled();
        });

        it('should call a custom update function', () => {
          spy = jest.fn();
          let gameObject = GameObject({
            update: spy
          });

          gameObject.update();

          expect(spy).toHaveBeenCalled();
        });

        if (testContext.GAMEOBJECT_GROUP) {
          it('should call update on each child', () => {
            let child = {
              update: jest.fn()
            };

            gameObject.addChild(child);
            gameObject.update();

            expect(child.update).toHaveBeenCalled();
          });
        } else {
          it('should not call update on each child', () => {
            let child = {
              update: jest.fn()
            };

            gameObject.children = [child];

            gameObject.update();

            expect(child.update).not.toHaveBeenCalled();
          });
        }
      });
    });

    // --------------------------------------------------
    // setScale
    // --------------------------------------------------
    describe('setScale', () => {
      if (testContext.GAMEOBJECT_SCALE) {
        it('should set the x and y scale', () => {
          gameObject.setScale(2, 2);

          expect(gameObject.scaleX).toBe(2);
          expect(gameObject.scaleY).toBe(2);
        });

        it('should default y to the x argument', () => {
          gameObject.setScale(2);

          expect(gameObject.scaleX).toBe(2);
          expect(gameObject.scaleY).toBe(2);
        });
      } else {
        it('should not have setScale', () => {
          expect(gameObject.setScale).toBeUndefined();
        });
      }
    });
  }
);
