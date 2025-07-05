import * as helpers from '../../src/helpers.js';
import Sprite from '../../src/sprite.js';
import TileEngine from '../../src/tileEngine.js';

// --------------------------------------------------
// helpers
// --------------------------------------------------
describe('helpers', () => {
  it('should export api', () => {
    expect(typeof helpers.degToRad).toBe('function');
    expect(typeof helpers.radToDeg).toBe('function');
    expect(typeof helpers.angleToTarget).toBe('function');
    expect(typeof helpers.rotatePoint).toBe('function');
    expect(typeof helpers.movePoint).toBe('function');
    expect(typeof helpers.lerp).toBe('function');
    expect(typeof helpers.inverseLerp).toBe('function');
    expect(typeof helpers.clamp).toBe('function');
    expect(typeof helpers.getStoreItem).toBe('function');
    expect(typeof helpers.setStoreItem).toBe('function');
    expect(typeof helpers.collides).toBe('function');
    expect(typeof helpers.getWorldRect).toBe('function');
    expect(typeof helpers.depthSort).toBe('function');
  });

  // --------------------------------------------------
  // degToRad
  // --------------------------------------------------
  describe('degToRad', () => {
    it('should convert degrees to radians', () => {
      expect(helpers.degToRad(22.35).toFixed(2)).toBe('0.39');
    });
  });

  // --------------------------------------------------
  // radToDeg
  // --------------------------------------------------
  describe('radToDeg', () => {
    it('should convert radians to degrees', () => {
      expect(helpers.radToDeg(0.39).toFixed(2)).toBe('22.35');
    });
  });

  // --------------------------------------------------
  // angleToTarget
  // --------------------------------------------------
  describe('angleToTarget', () => {
    it('should return the angle to the target', () => {
      let source = { x: 300, y: 300 };
      let target = { x: 100, y: 100 };
      expect(helpers.angleToTarget(source, target)).toBe(
        (-Math.PI * 3) / 4
      );
      expect(helpers.angleToTarget(target, source)).toBe(
        Math.PI / 4
      );
    });
  });

  // --------------------------------------------------
  // rotatePoint
  // --------------------------------------------------
  describe('rotatePoint', () => {
    it('should return the new x and y after rotation', () => {
      let point = { x: 300, y: 300 };
      let angle = helpers.degToRad(35);
      let newPoint = helpers.rotatePoint(point, angle);
      expect(newPoint.x.toFixed(2)).toBe('73.67');
      expect(newPoint.y.toFixed(2)).toBe('417.82');
    });
  });

  // --------------------------------------------------
  // movePoint
  // --------------------------------------------------
  describe('movePoint', () => {
    it('should return the new x and y after move', () => {
      let point = { x: 300, y: 300 };
      let newPoint = helpers.movePoint(
        point,
        (-Math.PI * 3) / 4,
        141.421
      );
      expect(newPoint.x).toBeCloseTo(200, 1);
      expect(newPoint.y).toBeCloseTo(200, 1);

      newPoint = helpers.movePoint(point, Math.PI / 4, 141.421);
      expect(newPoint.x).toBeCloseTo(400, 1);
      expect(newPoint.y).toBeCloseTo(400, 1);

      newPoint = helpers.movePoint(point, Math.PI, 100);
      expect(newPoint.x).toBeCloseTo(200, 1);
      expect(newPoint.y).toBeCloseTo(300, 1);
    });
  });

  // --------------------------------------------------
  // lerp
  // --------------------------------------------------
  describe('lerp', () => {
    it('should calculate the linear interpolation', () => {
      expect(helpers.lerp(10, 20, 0.5)).toBe(15);
    });

    it('should handle negative numbers', () => {
      expect(helpers.lerp(-10, 20, 0.5)).toBe(5);
    });

    it('should handle percentages greater than 1', () => {
      expect(helpers.lerp(10, 20, 2)).toBe(30);
    });

    it('should handle negative percentages', () => {
      expect(helpers.lerp(10, 20, -1)).toBe(0);
    });
  });

  // --------------------------------------------------
  // inverseLerp
  // --------------------------------------------------
  describe('inverseLerp', () => {
    it('should calculate the inverse linear interpolation', () => {
      expect(helpers.inverseLerp(10, 20, 15)).toBe(0.5);
    });

    it('should handle negative numbers', () => {
      expect(helpers.inverseLerp(-10, 20, 5)).toBe(0.5);
    });

    it('should handle percentages greater than 1', () => {
      expect(helpers.inverseLerp(10, 20, 30)).toBe(2);
    });

    it('should handle negative percentages', () => {
      expect(helpers.inverseLerp(10, 20, 0)).toBe(-1);
    });
  });

  // --------------------------------------------------
  // clamp
  // --------------------------------------------------
  describe('clamp', () => {
    it('should clamp the value when below min', () => {
      expect(helpers.clamp(10, 20, 5)).toBe(10);
    });

    it('should clamp the value when above max', () => {
      expect(helpers.clamp(10, 20, 30)).toBe(20);
    });

    it('should retain the number when between min and max', () => {
      expect(helpers.clamp(10, 20, 15)).toBe(15);
    });
  });

  // --------------------------------------------------
  // store
  // --------------------------------------------------
  describe('store', () => {
    it('should be able to save all data types to local storage', () => {
      localStorage.clear();

      var fn = function () {
        helpers.setStoreItem('boolean', true);
        helpers.setStoreItem('null', null);
        helpers.setStoreItem('undefined', undefined);
        helpers.setStoreItem('number', 1);
        helpers.setStoreItem('string', 'hello');
        helpers.setStoreItem('object', { foo: 'bar' });
        helpers.setStoreItem('array', [1, 2]);
      };

      expect(fn).not.toThrow();
    });

    it('should be able to read all data types out of local storage', () => {
      expect(helpers.getStoreItem('boolean')).toBe(true);
      expect(helpers.getStoreItem('number')).toBe(1);
      expect(helpers.getStoreItem('string')).toBe('hello');
      expect(helpers.getStoreItem('object')).toEqual({
        foo: 'bar'
      });
      expect(helpers.getStoreItem('array')).toEqual([1, 2]);
    });

    it('should remove a key from local storage using the set function when passed undefined', () => {
      helpers.setStoreItem('number', undefined);

      expect(helpers.getStoreItem('number')).not.toBe(true);
    });
  });

  // --------------------------------------------------
  // collides
  // --------------------------------------------------
  describe('collides', () => {
    it('should correctly detect collision between two objects', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      let sprite2 = Sprite({
        x: 19,
        y: 39,
        width: 10,
        height: 20
      });

      expect(helpers.collides(sprite1, sprite2)).toBe(true);

      sprite2.x = 10;
      sprite2.y = 20;

      expect(helpers.collides(sprite1, sprite2)).toBe(true);

      sprite2.x = 1;
      sprite2.y = 1;

      expect(helpers.collides(sprite1, sprite2)).toBe(true);

      sprite2.x = 20;
      sprite2.y = 40;

      expect(helpers.collides(sprite1, sprite2)).toBe(false);

      sprite2.x = 0;
      sprite2.y = 0;

      expect(helpers.collides(sprite1, sprite2)).toBe(false);
    });

    it('should take into account sprite.anchor', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20,
        anchor: { x: 0.5, y: 0.5 }
      });

      let sprite2 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      expect(helpers.collides(sprite1, sprite2)).toBe(true);

      sprite1.anchor = { x: 1, y: 0 };

      expect(helpers.collides(sprite1, sprite2)).toBe(false);

      sprite2.anchor = { x: 1, y: 0 };

      expect(helpers.collides(sprite1, sprite2)).toBe(true);
    });

    it('should take into account sprite.scale', () => {
      let sprite1 = Sprite({
        x: 5,
        y: 20,
        width: 10,
        height: 20,
        scaleX: 1,
        scaleY: 1
      });

      let sprite2 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      expect(helpers.collides(sprite1, sprite2)).toBe(true);

      sprite1.scaleX = 0.5;
      sprite1.scaleY = 0.5;

      expect(helpers.collides(sprite1, sprite2)).toBe(false);

      sprite1.scaleX = 2;
      sprite1.scaleY = 2;

      expect(helpers.collides(sprite1, sprite2)).toBe(true);
    });

    it('should work for non-sprite objects', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      let obj = {
        x: 10,
        y: 20,
        width: 10,
        height: 20
      };

      expect(helpers.collides(sprite1, obj)).toBe(true);
      expect(helpers.collides(obj, sprite1)).toBe(true);
    });

    it('should correctly detect collision between two circles', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        radius: 5
      });

      let sprite2 = Sprite({
        x: 10,
        y: 25,
        radius: 10
      });

      expect(helpers.collides(sprite1, sprite2)).toBe(true);

      sprite2.x = 19;
      sprite2.y = 20;

      expect(helpers.collides(sprite1, sprite2)).toBe(true);

      sprite2.x = 1;
      sprite2.y = 1;

      expect(helpers.collides(sprite1, sprite2)).toBe(true);

      sprite2.x = 20;
      sprite2.y = 20;

      expect(helpers.collides(sprite1, sprite2)).toBe(false);

      sprite2.x = 0;
      sprite2.y = 0;

      expect(helpers.collides(sprite1, sprite2)).toBe(false);
    });

    it('should correctly detect collision between a circle and rectangle', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      let sprite2 = Sprite({
        x: 10,
        y: 25,
        radius: 10
      });

      expect(helpers.collides(sprite1, sprite2)).toBe(true);

      sprite2.x = 19;
      sprite2.y = 20;

      expect(helpers.collides(sprite2, sprite1)).toBe(true);

      sprite2.x = 1;
      sprite2.y = 1;

      expect(helpers.collides(sprite1, sprite2)).toBe(true);

      sprite2.x = 20;
      sprite2.y = 20;

      expect(helpers.collides(sprite1, sprite2)).toBe(false);

      sprite2.x = 0;
      sprite2.y = 0;

      expect(helpers.collides(sprite2, sprite1)).toBe(false);
    });

    it('returns false if either object is a circle and not scaled uniformly', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        radius: 5,
        scaleX: 2
      });

      let sprite2 = Sprite({
        x: 10,
        y: 25,
        radius: 10
      });

      expect(helpers.collides(sprite1, sprite2)).toBe(false);

      sprite1.scaleY = 1;
      sprite2.scaleY = 2;

      expect(helpers.collides(sprite1, sprite2)).toBe(false);
    });
  });

  // --------------------------------------------------
  // getWorldRect
  // --------------------------------------------------
  describe('getWorldRect', () => {
    it('should return world x, y, width, and height', () => {
      let sprite = Sprite({
        x: 40,
        y: 40,
        width: 10,
        height: 10
      });
      let rect = helpers.getWorldRect(sprite);

      expect(rect.x).toBe(40);
      expect(rect.y).toBe(40);
      expect(rect.width).toBe(10);
      expect(rect.height).toBe(10);
    });

    it('should take into account radius', () => {
      let sprite = Sprite({
        x: 40,
        y: 40,
        radius: 5
      });
      let rect = helpers.getWorldRect(sprite);

      expect(rect.x).toBe(40);
      expect(rect.y).toBe(40);
      expect(rect.width).toBe(10);
      expect(rect.height).toBe(10);
    });

    it('should take into account anchor', () => {
      let sprite = Sprite({
        x: 40,
        y: 40,
        width: 10,
        height: 10,
        anchor: { x: 0.5, y: 0.5 }
      });
      let rect = helpers.getWorldRect(sprite);

      expect(rect.x).toBe(35);
      expect(rect.y).toBe(35);

      sprite.anchor = { x: 1, y: 1 };
      rect = helpers.getWorldRect(sprite);

      expect(rect.x).toBe(30);
      expect(rect.y).toBe(30);
    });

    it('should take into account negative scale', () => {
      let sprite = Sprite({
        x: 40,
        y: 40,
        width: 10,
        height: 20,
        scaleX: -2,
        scaleY: -2
      });
      let rect = helpers.getWorldRect(sprite);

      expect(rect.x).toBe(20);
      expect(rect.y).toBe(0);
      expect(rect.width).toBe(20);
      expect(rect.height).toBe(40);
    });

    it('should use objects world x, y, width, and height', () => {
      let sprite = {
        x: 40,
        y: 40,
        width: 10,
        height: 10,
        world: {
          x: 10,
          y: 20,
          width: 20,
          height: 30
        }
      };
      let rect = helpers.getWorldRect(sprite);

      expect(rect.x).toBe(10);
      expect(rect.y).toBe(20);
      expect(rect.width).toBe(20);
      expect(rect.height).toBe(30);
    });

    it('should work for tileEngine', () => {
      let tileEngine = TileEngine({
        width: 10,
        height: 12,
        tilewidth: 32,
        tileheight: 32,
        tilesets: []
      });
      let rect = helpers.getWorldRect(tileEngine);

      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
      expect(rect.width).toBe(320);
      expect(rect.height).toBe(384);
    });
  });

  // --------------------------------------------------
  // depthSort
  // --------------------------------------------------
  describe('depthSort', () => {
    it('should return the difference between the y props', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      let sprite2 = Sprite({
        x: 19,
        y: 39,
        width: 10,
        height: 20
      });

      let value = helpers.depthSort(sprite1, sprite2);

      expect(value).toBe(-19);
    });

    it('should take into account anchor', () => {
      let sprite1 = Sprite({
        x: 40,
        y: 40,
        width: 10,
        height: 10,
        anchor: { x: 0.5, y: 0.5 }
      });

      let sprite2 = Sprite({
        x: 40,
        y: 40,
        width: 10,
        height: 10,
        anchor: { x: 1, y: 1 }
      });

      let value = helpers.depthSort(sprite1, sprite2);

      expect(value).toBe(5);
    });

    it('should use objects world x, y, width, and height', () => {
      let sprite1 = {
        x: 40,
        y: 40,
        width: 10,
        height: 10,
        world: {
          x: 10,
          y: 20,
          width: 20,
          height: 30
        }
      };

      let sprite2 = Sprite({
        x: 19,
        y: 39,
        width: 10,
        height: 20
      });

      let value = helpers.depthSort(sprite1, sprite2);

      expect(value).toBe(-19);
    });

    it('should accept different prop to compare', () => {
      let sprite1 = Sprite({
        x: 10,
        y: 20,
        width: 10,
        height: 20
      });

      let sprite2 = Sprite({
        x: 20,
        y: 39,
        width: 10,
        height: 20
      });

      let value = helpers.depthSort(sprite1, sprite2, 'x');

      expect(value).toBe(-10);
    });
  });
});
