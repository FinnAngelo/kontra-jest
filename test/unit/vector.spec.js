import Vector, { VectorClass } from '../../src/vector.js';

// test-context:start
let testContext = {
  VECTOR_ANGLE: true,
  VECTOR_CLAMP: true,
  VECTOR_DIRECTION: true,
  VECTOR_DISTANCE: true,
  VECTOR_DOT: true,
  VECTOR_LENGTH: true,
  VECTOR_NORMALIZE: true,
  VECTOR_SCALE: true,
  VECTOR_SUBTRACT: true
};
// test-context:end

// --------------------------------------------------
// vector
// --------------------------------------------------
describe(
  'vector with context: ' + JSON.stringify(testContext, null, 4),
  () => {
    it('should export class', () => {
      expect(typeof VectorClass).toBe('function');
    });

    // --------------------------------------------------
    // init
    // --------------------------------------------------
    describe('init', () => {
      it('should set x and y', () => {
        let vector = Vector(10, 20);

        expect(vector.x).toBe(10);
        expect(vector.y).toBe(20);
      });

      it('should take an object', () => {
        let vector = Vector({ x: 10, y: 20 });

        expect(vector.x).toBe(10);
        expect(vector.y).toBe(20);
      });
    });

    // --------------------------------------------------
    // set
    // --------------------------------------------------
    describe('set', () => {
      it('should set x and y', () => {
        let vector = Vector(10, 20);
        vector.set({ x: 20, y: 10 });

        expect(vector.x).toBe(20);
        expect(vector.y).toBe(10);
      });
    });

    // --------------------------------------------------
    // add
    // --------------------------------------------------
    describe('add', () => {
      it('should add one vector to another', () => {
        let vector1 = Vector(10, 20);
        let vector2 = Vector(5, 10);

        let vector = vector1.add(vector2);

        expect(vector.x).toBe(15);
        expect(vector.y).toBe(30);
      });

      it('should not modify either vectors', () => {
        let vector1 = Vector(10, 20);
        let vector2 = Vector(5, 10);

        vector1.add(vector2);

        expect(vector1.x).toBe(10);
        expect(vector1.y).toBe(20);
        expect(vector2.x).toBe(5);
        expect(vector2.y).toBe(10);
      });
    });

    // --------------------------------------------------
    // subtract
    // --------------------------------------------------
    describe('subtract', () => {
      if (testContext.VECTOR_SUBTRACT) {
        it('should subtract one vector from another', () => {
          let vector1 = Vector(10, 20);
          let vector2 = Vector(5, 10);

          let vector = vector1.subtract(vector2);

          expect(vector.x).toBe(5);
          expect(vector.y).toBe(10);
        });

        it('should not modify either vectors', () => {
          let vector1 = Vector(10, 20);
          let vector2 = Vector(5, 10);

          vector1.subtract(vector2);

          expect(vector1.x).toBe(10);
          expect(vector1.y).toBe(20);
          expect(vector2.x).toBe(5);
          expect(vector2.y).toBe(10);
        });
      } else {
        it('should not have subtract', () => {
          let vector = Vector();
          expect(vector.subtract).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // scale
    // --------------------------------------------------
    describe('scale', () => {
      if (testContext.VECTOR_SCALE) {
        it('should scale a vector by a scalar', () => {
          let vector1 = Vector(5, 10);

          let vector = vector1.scale(2);

          expect(vector.x).toBe(10);
          expect(vector.y).toBe(20);
        });

        it('should not modify the vector', () => {
          let vector1 = Vector(5, 10);

          vector1.scale(2);

          expect(vector1.x).toBe(5);
          expect(vector1.y).toBe(10);
        });
      } else {
        it('should not have scale', () => {
          let vector = Vector();
          expect(vector.scale).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // normalize
    // --------------------------------------------------
    describe('normalize', () => {
      if (testContext.VECTOR_NORMALIZE) {
        it('should calculate the normalized vector', () => {
          let vector1 = Vector(4, 3);

          let normalize = vector1.normalize();

          expect(normalize.x).toBe(4 / 5);
          expect(normalize.y).toBe(3 / 5);
        });

        it('should return 0 for zero vector', () => {
          let vector1 = Vector();

          let normalize = vector1.normalize();

          expect(normalize.x).toBe(0);
          expect(normalize.y).toBe(0);
        })
      } else {
        it('should not have normalize', () => {
          let vector = Vector();
          expect(vector.normalize).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // dot
    // --------------------------------------------------
    describe('dot', () => {
      if (testContext.VECTOR_DOT || testContext.VECTOR_ANGLE) {
        it('should calculate dot product of two vectors', () => {
          let vector1 = Vector(10, 20);
          let vector2 = Vector(5, 10);

          let dot = vector1.dot(vector2);

          expect(dot).toBe(250);
        });
      } else {
        it('should not have dot', () => {
          let vector = Vector();
          expect(vector.dot).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // length
    // --------------------------------------------------
    describe('length', () => {
      if (
        testContext.VECTOR_LENGTH ||
        testContext.VECTOR_NORMALIZE ||
        testContext.VECTOR_ANGLE
      ) {
        it('should calculate the length of the vector', () => {
          let vector1 = Vector(4, 3);

          let length = vector1.length();

          expect(length).toBe(5);
        });
      } else {
        it('should not have length', () => {
          let vector = Vector();
          expect(vector.length).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // distance
    // --------------------------------------------------
    describe('distance', () => {
      if (testContext.VECTOR_DISTANCE) {
        it('should calculate the distance between two vectors', () => {
          let vector1 = Vector(10, 20);
          let vector2 = Vector(6, 17);

          let distance = vector1.distance(vector2);

          expect(distance).toBe(5);
        });
      } else {
        it('should not have distance', () => {
          let vector = Vector();
          expect(vector.distance).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // angle
    // --------------------------------------------------
    describe('angle', () => {
      if (testContext.VECTOR_ANGLE) {
        it('should calculate the angle between two vectors', () => {
          let vector1 = Vector(4, 3);
          let vector2 = Vector(3, 5);

          let angle = vector1.angle(vector2);

          expect(angle.toFixed(2)).toBe('0.39');
        });
      } else {
        it('should not have angle', () => {
          let vector = Vector();
          expect(vector.angle).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // direction
    // --------------------------------------------------
    describe('direction', () => {
      if (testContext.VECTOR_DIRECTION) {
        it('should calculate the angle between two vectors', () => {
          let vector1 = Vector(0, 3);
          let vector2 = Vector(-4, -4);

          let angle1 = vector1.direction();
          let angle2 = vector2.direction();

          expect(angle1).toBe(Math.PI/2);
          expect(angle2).toBe(-Math.PI + Math.PI/4);
        });
      } else {
        it('should not have direction', () => {
          let vector = Vector();
          expect(vector.direction).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // clamp
    // --------------------------------------------------
    describe('clamp', () => {
      if (testContext.VECTOR_CLAMP) {
        let vector;

        beforeEach(() => {
          vector = Vector(10, 20);
          vector.clamp(0, 10, 50, 75);
        });

        it('should clamp the vectors x value', () => {
          vector.x = -10;

          expect(vector.x).toBe(0);

          vector.x = 100;

          expect(vector.x).toBe(50);
        });

        it('should clamp the vectors y value', () => {
          vector.y = -10;

          expect(vector.y).toBe(10);

          vector.y = 100;

          expect(vector.y).toBe(75);
        });

        it('should preserve clamp settings when adding vectors', () => {
          let vec = vector.add(Vector(100, 100));

          expect(vec.x).toBe(50);
          expect(vec.y).toBe(75);
        });
      } else {
        it('should not have clamp', () => {
          let vector = Vector();
          expect(vector.clamp).toBeUndefined();
        });
      }
    });
  }
);
