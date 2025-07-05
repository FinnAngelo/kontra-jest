import SpriteSheet, {
  SpriteSheetClass
} from '../../src/spriteSheet.js';
import { noop } from '../../src/utils.js';

// --------------------------------------------------
// spriteSheet
// --------------------------------------------------
describe('spriteSheet', () => {
  it('should export class', () => {
    expect(typeof SpriteSheetClass).toBe('function');
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should log an error if no image is provided', () => {
      function func() {
        SpriteSheet();
      }

      expect(func).toThrow();
    });

    it('should initialize properties on the spriteSheet when passed an image', () => {
      let spriteSheet = SpriteSheet({
        image: new Image(100, 200),
        frameWidth: 10,
        frameHeight: 10,
        margin: 10,
        spacing: 20
      });

      expect(spriteSheet.frame.width).toBe(10);
      expect(spriteSheet.frame.height).toBe(10);
      expect(spriteSheet.frame.margin).toBe(10);
      expect(spriteSheet.frame.spacing).toBe(20);
      expect(spriteSheet._f).toBe(9);
    });

    it('should create animations if passed an animation object', () => {
      jest
        .spyOn(SpriteSheetClass.prototype, 'createAnimations')
        .mockImplementation(noop);

      SpriteSheet({
        image: new Image(100, 200),
        frameWidth: 10,
        frameHeight: 10,
        animations: {}
      });

      expect(SpriteSheetClass.prototype.createAnimations).toHaveBeenCalled();
    });

    it('should default margin and spacing to 0', () => {
      let spriteSheet = SpriteSheet({
        image: new Image(100, 200),
        frameWidth: 10,
        frameHeight: 10
      });

      expect(spriteSheet.frame.margin).toBe(0);
      expect(spriteSheet.frame.spacing).toBe(0);
      expect(spriteSheet._f).toBe(10);
    });
  });

  // --------------------------------------------------
  // createAnimations
  // --------------------------------------------------
  describe('createAnimations', () => {
    let spriteSheet;

    beforeEach(() => {
      spriteSheet = SpriteSheet({
        image: new Image(100, 200),
        frameWidth: 10,
        frameHeight: 10
      });
    });

    it('should log an error if no frames property was passed', () => {
      function func() {
        spriteSheet.createAnimations({
          walk: {}
        });
      }

      expect(func).toThrow();
    });

    it('should accept a single frame', () => {
      spriteSheet.createAnimations({
        walk: {
          frames: 1
        }
      });

      expect(spriteSheet.animations.walk).toBeDefined();
      expect(spriteSheet.animations.walk.frames).toEqual([1]);
    });

    it('should accept a string of ascending consecutive frames', () => {
      spriteSheet.createAnimations({
        walk: {
          frames: '1..5'
        }
      });

      expect(spriteSheet.animations.walk).toBeDefined();
      expect(spriteSheet.animations.walk.frames).toEqual([
        1, 2, 3, 4, 5
      ]);
    });

    it('should accept a string of descending consecutive frames', () => {
      spriteSheet.createAnimations({
        walk: {
          frames: '5..1'
        }
      });

      expect(spriteSheet.animations.walk).toBeDefined();
      expect(spriteSheet.animations.walk.frames).toEqual([
        5, 4, 3, 2, 1
      ]);
    });

    it('should accept an array of consecutive frames', () => {
      spriteSheet.createAnimations({
        walk: {
          frames: [1, 2, 3]
        }
      });

      expect(spriteSheet.animations.walk).toBeDefined();
      expect(spriteSheet.animations.walk.frames).toEqual([
        1, 2, 3
      ]);
    });

    it('should accept an array of non-consecutive frames', () => {
      spriteSheet.createAnimations({
        walk: {
          frames: [1, 3, 5]
        }
      });

      expect(spriteSheet.animations.walk).toBeDefined();
      expect(spriteSheet.animations.walk.frames).toEqual([
        1, 3, 5
      ]);
    });

    it('should accept a mixture of numbers, strings, and arrays', () => {
      spriteSheet.createAnimations({
        walk: {
          frames: [1, '2..3', 4, 5, '4..1']
        }
      });

      expect(spriteSheet.animations.walk).toBeDefined();
      expect(spriteSheet.animations.walk.frames).toEqual([
        1, 2, 3, 4, 5, 4, 3, 2, 1
      ]);
    });
  });
});
