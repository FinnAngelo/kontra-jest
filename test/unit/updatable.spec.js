import Updatable from '../../src/updatable.js';
import Vector, { VectorClass } from '../../src/vector.js';

// test-context:start
let testContext = {
  GAMEOBJECT_VELOCITY: true,
  GAMEOBJECT_ACCELERATION: true,
  GAMEOBJECT_TTL: true,
  VECTOR_SCALE: true
};
// test-context:end

// --------------------------------------------------
// updatable
// --------------------------------------------------
describe(
  'updatable with context: ' + JSON.stringify(testContext, null, 4),
  () => {
    let object;
    beforeEach(() => {
      object = new Updatable();
    });

    // --------------------------------------------------
    // constructor
    // --------------------------------------------------
    describe('constructor', () => {
      let spy;

      it('should call init', () => {
        spy = jest.spyOn(Updatable.prototype, 'init');

        let props = {};
        object = new Updatable(props);

        expect(spy).toHaveBeenCalledWith(props);
      });
    });

    // --------------------------------------------------
    // init
    // --------------------------------------------------
    describe('init', () => {
      it('should default position', () => {
        expect(object.position instanceof VectorClass).toBe(true);
        expect(object.position.x).toBe(0);
        expect(object.position.y).toBe(0);
      });

      if (testContext.GAMEOBJECT_VELOCITY) {
        it('should default velocity', () => {
          expect(object.velocity instanceof VectorClass).toBe(true);
          expect(object.velocity.x).toBe(0);
          expect(object.velocity.y).toBe(0);
        });
      } else {
        it('should not have velocity', () => {
          expect(object.velocity).toBeUndefined();
        });
      }

      if (testContext.GAMEOBJECT_ACCELERATION) {
        it('should default acceleration', () => {
          expect(object.acceleration instanceof VectorClass).toBe(true);
          expect(object.acceleration.x).toBe(0);
          expect(object.acceleration.y).toBe(0);
        });
      } else {
        it('should not have acceleration', () => {
          expect(object.acceleration).toBeUndefined();
        });
      }

      if (testContext.GAMEOBJECT_TTL) {
        it('should default ttl', () => {
          expect(object.ttl).toBe(Infinity);
        });
      } else {
        it('should not have ttl', () => {
          expect(object.ttl).toBeUndefined();
        });
      }

      if (testContext.GAMEOBJECT_VELOCITY) {
        it('should set dx and dy properties', () => {
          object = new Updatable({ dx: 10, dy: 20 });

          expect(object.velocity.x).toBe(10);
          expect(object.velocity.y).toBe(20);
        });
      }

      if (testContext.GAMEOBJECT_ACCELERATION) {
        it('should set ddx and ddy properties', () => {
          object = new Updatable({ ddx: 10, ddy: 20 });

          expect(object.acceleration.x).toBe(10);
          expect(object.acceleration.y).toBe(20);
        });
      }

      if (testContext.GAMEOBJECT_TTL) {
        it('should set ttl property', () => {
          object = new Updatable({ ttl: 20 });

          expect(object.ttl).toBe(20);
        });
      }

      it('should set any property', () => {
        object = new Updatable({ myProp: 'foo' });

        expect(object.myProp).toBe('foo');
      });
    });

    // --------------------------------------------------
    // velocity
    // --------------------------------------------------
    if (testContext.GAMEOBJECT_VELOCITY) {
      describe('velocity', () => {
        it('should set the velocity x property', () => {
          object.dx = 10;

          expect(object.velocity.x).toBe(10);
        });

        it('should return the velocity x property', () => {
          object.velocity.x = 10;

          expect(object.dx).toBe(10);
        });

        it('should set the velocity y property', () => {
          object.dy = 10;

          expect(object.velocity.y).toBe(10);
        });

        it('should return the velocity y property', () => {
          object.velocity.y = 10;

          expect(object.dy).toBe(10);
        });
      });
    }

    // --------------------------------------------------
    // acceleration
    // --------------------------------------------------
    if (testContext.GAMEOBJECT_ACCELERATION) {
      describe('acceleration', () => {
        it('should set the acceleration x property', () => {
          object.ddx = 10;

          expect(object.acceleration.x).toBe(10);
        });

        it('should return the acceleration x property', () => {
          object.acceleration.x = 10;

          expect(object.ddx).toBe(10);
        });

        it('should set the acceleration y property', () => {
          object.ddy = 10;

          expect(object.acceleration.y).toBe(10);
        });

        it('should return the acceleration y property', () => {
          object.acceleration.y = 10;

          expect(object.ddy).toBe(10);
        });
      });
    }

    // --------------------------------------------------
    // isAlive
    // --------------------------------------------------
    if (testContext.GAMEOBJECT_TTL) {
      describe('isAlive', () => {
        it('should return true if ttl is above 0', () => {
          object.ttl = 20;

          expect(object.isAlive()).toBe(true);
        });

        it('should return true if ttl is less than 0', () => {
          object.ttl = 0;

          expect(object.isAlive()).toBe(false);

          object.ttl = -20;

          expect(object.isAlive()).toBe(false);
        });
      });
    }

    // --------------------------------------------------
    // update
    // --------------------------------------------------
    describe('update', () => {
      it('should call the advance function', () => {
        jest.spyOn(object, 'advance').mockImplementation(() => {});

        object.update();

        expect(object.advance).toHaveBeenCalled();
      });

      it('should pass dt', () => {
        jest.spyOn(object, 'advance').mockImplementation(() => {});

        object.update(1 / 60);

        expect(object.advance).toHaveBeenCalledWith(1 / 60);
      });
    });

    // --------------------------------------------------
    // advance
    // --------------------------------------------------
    describe('advance', () => {
      if (
        testContext.GAMEOBJECT_VELOCITY &&
        testContext.GAMEOBJECT_ACCELERATION
      ) {
        it('should add the acceleration to the velocity', () => {
          object.velocity = Vector(5, 10);
          object.acceleration = Vector(15, 20);

          object.advance();

          expect(object.velocity.x).toBe(20);
          expect(object.velocity.y).toBe(30);
        });

        if (testContext.VECTOR_SCALE) {
          it('should use dt to scale the acceleration', () => {
            object.velocity = Vector(5, 10);
            object.acceleration = Vector(10, 20);

            object.advance(0.5);

            expect(object.velocity.x).toBe(10);
            expect(object.velocity.y).toBe(20);
          });
        } else {
          it('should not use dt to scale the acceleration', () => {
            object.velocity = Vector(5, 10);
            object.acceleration = Vector(15, 20);

            object.advance(0.5);

            expect(object.velocity.x).toBe(20);
            expect(object.velocity.y).toBe(30);
          });
        }
      }

      if (testContext.GAMEOBJECT_VELOCITY) {
        it('should add the velocity to the position', () => {
          object.position = Vector(5, 10);
          object.velocity = Vector(15, 20);

          object.advance();

          expect(object.position.x).toBe(20);
          expect(object.position.y).toBe(30);
        });

        if (testContext.VECTOR_SCALE) {
          it('should use dt to scale the velocity', () => {
            object.position = Vector(5, 10);
            object.velocity = Vector(10, 20);

            object.advance(0.5);

            expect(object.position.x).toBe(10);
            expect(object.position.y).toBe(20);
          });
        } else {
          it('should not use dt to scale the velocity', () => {
            object.position = Vector(5, 10);
            object.velocity = Vector(15, 20);

            object.advance(0.5);

            expect(object.position.x).toBe(20);
            expect(object.position.y).toBe(30);
          });
        }
      } else {
        it('should not modify the position', () => {
          object.position = Vector(5, 10);
          object.velocity = Vector(15, 20);

          object.advance();

          expect(object.position.x).toBe(5);
          expect(object.position.y).toBe(10);
        });
      }

      if (testContext.GAMEOBJECT_TTL) {
        it('should update ttl', () => {
          object.ttl = 10;

          object.advance();

          expect(object.ttl).toBe(9);
        });
      } else {
        it('should not modify the ttl', () => {
          object.ttl = 10;

          object.advance();

          expect(object.ttl).toBe(10);
        });
      }
    });
  }
);
