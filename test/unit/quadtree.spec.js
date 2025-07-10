import Quadtree, { QuadtreeClass } from '../../src/quadtree.js';
import { getCanvas } from '../../src/core.js';

// --------------------------------------------------
// quadtree
// --------------------------------------------------
describe('quadtree', () => {
  test('should export class', () => {
    expect(typeof QuadtreeClass).toBe('function');
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    test('should create an initial bounding box', () => {
      let quadtree = Quadtree();

      expect(typeof quadtree.bounds).toBe('object');
      expect(quadtree.bounds.x).toBe(0);
      expect(quadtree.bounds.y).toBe(0);
      expect(quadtree.bounds.width).toBe(getCanvas().width);
      expect(quadtree.bounds.height).toBe(getCanvas().height);
    });

    test('should allow you to set the maxDepth and maxObject counts', () => {
      let quadtree = Quadtree({
        maxDepth: 1,
        maxObjects: 10
      });

      expect(quadtree.maxDepth).toBe(1);
      expect(quadtree.maxObjects).toBe(10);
    });

    test('should allow you to set the bounds', () => {
      let quadtree = Quadtree({
        bounds: { x: 5, y: 10, width: 5, height: 10 }
      });

      expect(quadtree.bounds).toEqual({
        x: 5,
        y: 10,
        width: 5,
        height: 10
      });
    });
  });

  // --------------------------------------------------
  // add
  // --------------------------------------------------
  describe('add', () => {
    let quadtree;

    beforeEach(() => {
      quadtree = Quadtree({
        maxObjects: 5,
        bounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      });
    });

    afterEach(() => {
      quadtree.clear();
    });

    test('should add an object to the quadtree', () => {
      quadtree.add({ id: 1 });

      expect(quadtree._o.length).toBe(1);
    });

    test('should take multiple objects and add them to the quadtree', () => {
      quadtree.add({ id: 1 }, { id: 2 }, { id: 3 });

      expect(quadtree._o.length).toBe(3);
    });

    test('should take an array of objects and add them to the quadtree', () => {
      quadtree.add([{ id: 1 }, { id: 2 }], { id: 3 });

      expect(quadtree._o.length).toBe(3);
    });

    test('should split the quadtree if there are too many objects', () => {
      for (let i = 0; i < 5; i++) {
        quadtree.add({ id: i });
      }

      expect(quadtree._o.length).toBe(5);
      expect(quadtree._s.length).toBe(0);

      quadtree.add({ id: 4 });

      expect(quadtree._o.length).toBe(0);
      expect(quadtree._s.length).toBe(4);
    });

    test('should make each subnode 1/4 the size of the bounds when split', () => {
      for (let i = 0; i < 6; i++) {
        quadtree.add({ id: i });
      }

      expect(quadtree._s[0].bounds).toEqual({
        x: 0,
        y: 0,
        width: 50,
        height: 50
      });
      expect(quadtree._s[1].bounds).toEqual({
        x: 50,
        y: 0,
        width: 50,
        height: 50
      });
      expect(quadtree._s[2].bounds).toEqual({
        x: 0,
        y: 50,
        width: 50,
        height: 50
      });
      expect(quadtree._s[3].bounds).toEqual({
        x: 50,
        y: 50,
        width: 50,
        height: 50
      });
    });

    test('should add split objects to their correct subnodes', () => {
      let subnode;
      let objects = [
        { id: 0, x: 15, y: 10, width: 10, height: 10 }, // quadrant 0
        { id: 1, x: 30, y: 20, width: 10, height: 10 }, // quadrant 0
        { id: 2, x: 45, y: 30, width: 10, height: 10 }, // quadrant 0,1
        { id: 3, x: 60, y: 40, width: 10, height: 10 }, // quadrant 1,3
        { id: 4, x: 75, y: 50, width: 10, height: 10 }, // quadrant 3
        { id: 5, x: 90, y: 60, width: 10, height: 10 } // quadrant 3
      ];

      quadtree.add(objects);

      // quadrant 0
      subnode = quadtree._s[0]._o;

      expect(subnode.length).toBe(3);
      expect(subnode.indexOf(objects[0])).not.toBe(-1);
      expect(subnode.indexOf(objects[1])).not.toBe(-1);
      expect(subnode.indexOf(objects[2])).not.toBe(-1);

      // quadrant 1
      subnode = quadtree._s[1]._o;

      expect(subnode.length).toBe(2);
      expect(subnode.indexOf(objects[2])).not.toBe(-1);
      expect(subnode.indexOf(objects[3])).not.toBe(-1);

      // quadrant 2
      subnode = quadtree._s[2]._o;

      expect(subnode.length).toBe(0);

      // quadrant 3
      subnode = quadtree._s[3]._o;

      expect(subnode.length).toBe(3);
      expect(subnode.indexOf(objects[3])).not.toBe(-1);
      expect(subnode.indexOf(objects[4])).not.toBe(-1);
      expect(subnode.indexOf(objects[5])).not.toBe(-1);
    });

    test('should add an object to a subnode if the quadtree is already split', () => {
      for (let i = 0; i < 6; i++) {
        quadtree.add({ id: i });
      }

      let object = { x: 10, y: 10, width: 10, height: 10 };
      let subnode = quadtree._s[0]._o;

      quadtree.add(object);

      expect(subnode.length).toBe(1);
      expect(subnode[0]).toBe(object);
    });

    test("shouldn't split a quadtree node twice after clearing", () => {
      // cause the tree to split
      for (let i = 0; i < 6; i++) {
        quadtree.add({ id: i });
      }

      let subnodes = quadtree._s;

      quadtree.clear();

      // cause to split again
      for (let i = 0; i < 6; i++) {
        quadtree.add({ id: i });
      }

      // since splitting overrides the subnodes with new values this
      // should test that the subnodes were left alone after the 2nd
      // split
      expect(quadtree._s).toBe(subnodes);
    });

    test('should handle children outside the bounds of the quadtree', () => {
      let subnode;
      let quadtree = new Quadtree({
        bounds: { x: 0, y: 0, width: 100, height: 100 },
        maxObjects: 2,
        maxDepth: 1
      });

      quadtree.add({ x: 105, y: 40, width: 10, height: 20 });
      quadtree.add({ x: 105, y: 40, width: 10, height: 20 });

      // force the tree to split
      quadtree.add({ x: 105, y: 40, width: 10, height: 20 });

      // quadrant 0
      subnode = quadtree._s[0]._o;

      expect(subnode.length).toBe(0);

      // quadrant 1
      subnode = quadtree._s[1]._o;

      expect(subnode.length).toBe(3);

      // quadrant 2
      subnode = quadtree._s[2]._o;

      expect(subnode.length).toBe(0);

      // quadrant 3
      subnode = quadtree._s[3]._o;

      expect(subnode.length).toBe(3);
    });
  });

  // --------------------------------------------------
  // clear
  // --------------------------------------------------
  describe('clear', () => {
    let quadtree;

    beforeEach(() => {
      quadtree = Quadtree({
        maxObjects: 5,
        bounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      });
    });

    test('should clear all objects of the quadtree', () => {
      for (let i = 0; i < 4; i++) {
        quadtree.add({
          id: i,
          x: i * 15,
          y: i * 10,
          width: 10,
          height: 10
        });
      }

      quadtree.clear();

      expect(quadtree._o.length).toBe(0);
    });

    test('should clear all objects in subnodes of the quadtree', () => {
      for (let i = 0; i < 9; i++) {
        quadtree.add({
          id: i,
          x: i * 10,
          y: i * 10,
          width: 10,
          height: 10
        });
      }

      quadtree.clear();

      expect(quadtree._o.length).toBe(0);
      expect(quadtree._s[0]._o.length).toBe(0);
      expect(quadtree._s[1]._o.length).toBe(0);
      expect(quadtree._s[2]._o.length).toBe(0);
      expect(quadtree._s[3]._o.length).toBe(0);
    });
  });

  // --------------------------------------------------
  // get
  // --------------------------------------------------
  describe('get', () => {
    let quadtree;

    beforeEach(() => {
      quadtree = Quadtree({
        maxObjects: 5,
        bounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      });
    });

    afterEach(() => {
      quadtree.clear();
    });

    test('should return an object in the same node as the passed object', () => {
      let object = { x: 10, y: 10, width: 10, height: 10 };

      quadtree.add(object);

      let getObjects = quadtree.get({
        x: 30,
        y: 30,
        width: 20,
        height: 20
      });

      expect(getObjects.length).toBe(1);
      expect(getObjects[0]).toBe(object);
    });

    test('should return all objects in multiple subnodes if the object intercepts multiple subnodes', () => {
      let objects = [
        { x: 10, y: 10, width: 10, height: 10 },
        { x: 60, y: 10, width: 10, height: 10 }
      ];

      quadtree.add(objects);

      let getObjects = quadtree.get({
        x: 45,
        y: 25,
        width: 20,
        height: 20
      });

      expect(getObjects.length).toBe(2);
      expect(getObjects[0]).toBe(objects[0]);
      expect(getObjects[1]).toBe(objects[1]);
    });

    test('should return objects from leaf nodes', () => {
      let objects = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 10, y: 10, width: 10, height: 10 },
        { x: 20, y: 20, width: 10, height: 10 },
        { x: 30, y: 30, width: 10, height: 10 },
        { x: 40, y: 40, width: 10, height: 10 },
        { x: 50, y: 50, width: 10, height: 10 },
        { x: 60, y: 10, width: 10, height: 10 }
      ];

      quadtree.add(objects);

      let getObjects = quadtree.get({
        x: 5,
        y: 25,
        width: 20,
        height: 20
      });

      expect(getObjects.length).toBe(5);
      expect(getObjects[0]).toBe(objects[0]);
      expect(getObjects[1]).toBe(objects[1]);
      expect(getObjects[2]).toBe(objects[2]);
      expect(getObjects[3]).toBe(objects[3]);
      expect(getObjects[4]).toBe(objects[4]);
    });

    test('should not return the passed object', () => {
      let objects = [
        { x: 10, y: 10, width: 10, height: 10 },
        { x: 20, y: 10, width: 10, height: 10 }
      ];

      quadtree.add(objects);

      let getObjects = quadtree.get(objects[0]);

      expect(getObjects.length).toBe(1);
      expect(getObjects[0]).toBe(objects[1]);
    });

    test('should not return the same object more than once', () => {
      let objects = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 10, y: 10, width: 10, height: 10 },
        { x: 20, y: 20, width: 10, height: 10 },
        { x: 30, y: 30, width: 10, height: 10 },
        { x: 40, y: 40, width: 10, height: 10 },
        { x: 50, y: 50, width: 10, height: 10 },
        { x: 60, y: 10, width: 10, height: 10 }
      ];

      quadtree.add(objects);

      let getObjects = quadtree.get({
        x: 45,
        y: 45,
        width: 20,
        height: 20
      });

      expect(getObjects.length).toBe(7);
    });
  });
});
