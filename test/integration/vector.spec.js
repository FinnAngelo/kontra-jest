import Vector from '../../src/vector.js';
import { init, getCanvas } from '../../src/core.js';
import { rotatePoint, movePoint } from '../../src/helpers.js';

describe('vector integration', () => {
  beforeAll(() => {
    if (!getCanvas()) {
      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);
    }
  });

  it('should set from rotatePoint', () => {
    let vector = Vector(rotatePoint({ x: 10, y: 10 }, Math.PI));

    expect(vector.x).toBeCloseTo(-10, 1);
    expect(vector.y).toBeCloseTo(-10, 1);
  });

  it('should set from movePoint', () => {
    let vector = Vector(movePoint({ x: 10, y: 10 }, 0, 10));

    expect(vector.x).toBe(20);
    expect(vector.y).toBe(10);
  });
});