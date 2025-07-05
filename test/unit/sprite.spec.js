import Sprite, { SpriteClass } from '../../src/sprite.js';
import { noop } from '../../src/utils.js';

// test-context:start
let testContext = {
  SPRITE_IMAGE: true,
  SPRITE_ANIMATION: true,
  GAMEOBJECT_RADIUS: true
};
// test-context:end

// --------------------------------------------------
// sprite
// --------------------------------------------------
describe(
  'sprite with context: ' + JSON.stringify(testContext, null, 4),
  () => {
    test('should export class', () => {
      expect(typeof SpriteClass).toBe('function');
    });

    // --------------------------------------------------
    // init
    // --------------------------------------------------
    describe('init', () => {
      if (testContext.SPRITE_IMAGE) {
        test('should set the width and height of the sprite to an image if passed', () => {
          let img = new Image();
          img.width = 10;
          img.height = 20;

          let sprite = Sprite({
            image: img
          });

          expect(sprite.image).toBe(img);
          expect(sprite.width).toBe(10);
          expect(sprite.height).toBe(20);
        });
      }

      if (testContext.SPRITE_IMAGE) {
        test('should allow user to override with and height of image', () => {
          let img = new Image();
          img.width = 10;
          img.height = 20;

          let sprite = Sprite({
            image: img,
            width: 20,
            height: 40
          });

          expect(sprite.image).toBe(img);
          expect(sprite.width).toBe(20);
          expect(sprite.height).toBe(40);
        });
      }

      if (testContext.SPRITE_ANIMATION) {
        test('should set the width and height of the sprite to an animation if passed', () => {
          // simple animation object from spriteSheet
          let animations = {
            walk: {
              width: 10,
              height: 20,
              clone() {
                return this;
              }
            }
          };

          let sprite = Sprite({ animations });

          expect(sprite.animations).toEqual(animations);
          expect(sprite.currentAnimation).toBe(animations.walk);
          expect(sprite.width).toBe(10);
          expect(sprite.height).toBe(20);
        });
      }

      if (testContext.SPRITE_ANIMATION) {
        test('should clone any animations to prevent frame corruption', () => {
          let animations = {
            walk: {
              width: 10,
              height: 20,
              clone: jest.fn().mockReturnValue({
                width: 10,
                height: 20,
                clone: function() { return this; }
              })
            }
          };

          Sprite({
            animations
          });

          expect(animations.walk.clone).toHaveBeenCalled();
        });
      }
    });

    // --------------------------------------------------
    // update
    // --------------------------------------------------
    describe('update', () => {
      if (testContext.SPRITE_ANIMATION) {
        test('should update the animation', () => {
          // simple animation object from spriteSheet
          let animations = {
            walk: {
              width: 10,
              height: 20,
              update: jest.fn(),
              clone() {
                return this;
              }
            }
          };

          let sprite = Sprite({
            x: 10,
            y: 20,
            animations
          });
          sprite.update();

          expect(sprite.currentAnimation.update).toHaveBeenCalled();
        });
      } else {
        test('should not update the animation', () => {
          let animations = {
            walk: {
              width: 10,
              height: 20,
              update: jest.fn(),
              clone() {
                return this;
              }
            }
          };

          let sprite = Sprite({
            x: 10,
            y: 20,
            animations,
            currentAnimation: animations.walk
          });
          sprite.update();

          expect(sprite.currentAnimation.update).not.toHaveBeenCalled();
        });
      }
    });

    // --------------------------------------------------
    // render
    // --------------------------------------------------
    describe('render', () => {
      test('should draw a rect sprite', () => {
        let sprite = Sprite({
          x: 10,
          y: 20,
          color: true
        });

        const fillRectSpy = jest.spyOn(sprite.context, 'fillRect').mockImplementation(noop);

        sprite.render();

        expect(fillRectSpy).toHaveBeenCalled();
      });

      if (testContext.GAMEOBJECT_RADIUS) {
        test('should draw a circle sprite', () => {
          let sprite = Sprite({
            x: 10,
            y: 20,
            radius: 10,
            color: true
          });

          const arcSpy = jest.spyOn(sprite.context, 'arc').mockImplementation(noop);

          sprite.render();

          expect(arcSpy).toHaveBeenCalled();
        });
      }

      if (testContext.SPRITE_IMAGE) {
        test('should draw an image sprite', () => {
          let img = new Image();
          img.width = 10;
          img.height = 20;

          let sprite = Sprite({
            x: 10,
            y: 20,
            image: img
          });

          const drawImageSpy = jest.spyOn(sprite.context, 'drawImage').mockImplementation(noop);

          sprite.render();

          expect(drawImageSpy).toHaveBeenCalled();
        });
      }

      if (testContext.SPRITE_ANIMATION) {
        test('should draw an animation sprite', () => {
          // simple animation object from spriteSheet
          let animations = {
            walk: {
              width: 10,
              height: 20,
              update: noop,
              render: jest.fn(),
              clone() {
                return this;
              }
            }
          };

          let sprite = Sprite({
            x: 10,
            y: 20,
            animations
          });

          sprite.render();

          expect(sprite.currentAnimation.render).toHaveBeenCalled();
        });
      }
    });

    // --------------------------------------------------
    // playAnimation
    // --------------------------------------------------
    describe('playAnimation', () => {
      if (testContext.SPRITE_ANIMATION) {
        test('should set the animation to play', () => {
          let animations = {
            walk: {
              width: 10,
              height: 20,
              reset: jest.fn(),
              clone() {
                return this;
              },
              stop: noop,
              start: noop
            },
            idle: {
              width: 10,
              height: 20,
              reset: jest.fn(),
              clone() {
                return this;
              },
              stop: noop,
              start: noop
            }
          };

          let sprite = Sprite({
            animations
          });

          expect(sprite.currentAnimation).toBe(animations.walk);

          sprite.playAnimation('idle');

          expect(sprite.currentAnimation).toBe(animations.idle);
        });
      } else {
        test('should not have animation property', () => {
          let sprite = Sprite();
          expect(sprite.animations).toBeUndefined();
        });
      }
    });
  }
);
