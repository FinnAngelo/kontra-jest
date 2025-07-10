import TileEngine, { TileEngineClass } from '../../src/tileEngine.js';
import {
  _reset,
  init,
  getContext,
  getCanvas
} from '../../src/core.js';
import { noop } from '../../src/utils.js';

// test-context:start
let testContext = {
  TILEENGINE_CAMERA: true,
  TILEENGINE_DYNAMIC: true,
  TILEENGINE_QUERY: true,
  TILEENGINE_TILED: true
};
// test-context:end

// --------------------------------------------------
// tileEngine
// --------------------------------------------------
describe(
  'tileEngine with context: ' + JSON.stringify(testContext, null, 4),
  () => {
    it('should export class', () => {
      expect(typeof TileEngineClass).toBe('function');
    });

    // --------------------------------------------------
    // tileEngine.init
    // --------------------------------------------------
    describe('init', () => {
      it('should initialize properties on the tile engine', () => {
        let data = {
          tilewidth: 10,
          tileheight: 10,
          width: 50,
          height: 50,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        };
        let tileEngine = TileEngine(data);

        expect(tileEngine.tilewidth).toBe(data.tilewidth);
        expect(tileEngine.tileheight).toBe(data.tileheight);
        expect(tileEngine.width).toBe(data.width);
        expect(tileEngine.height).toBe(data.height);
        expect(tileEngine.tilesets).toBe(data.tilesets);
        expect(tileEngine.layers).toBe(data.layers);
        expect(tileEngine.mapwidth).toBe(500);
        expect(tileEngine.mapheight).toBe(500);
      });

      it('should not error if context is not set', () => {
        _reset();

        function fn() {
          TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 50,
            height: 50,
            tilesets: [
              {
                image: new Image()
              }
            ],
            layers: [
              {
                name: 'test',
                data: [0, 0, 1, 0, 0]
              }
            ]
          });
        }

        expect(fn).not.toThrow();
      });

      it('should set context if kontra.init is called after created', () => {
        _reset();

        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 50,
          height: 50,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });

        expect(tileEngine.context).toBeUndefined();

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        init(canvas);

        expect(tileEngine.context).toBe(canvas.getContext('2d'));
      });

      it('should not override context when set if kontra.init is called after created', () => {
        _reset();

        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 50,
          height: 50,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });
        tileEngine.context = true;

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        init(canvas);

        expect(tileEngine.context).toBe(true);
      });

      it('should call prerender if kontra.init is called after created', () => {
        _reset();

        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 50,
          height: 50,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });

        jest.spyOn(tileEngine, '_p').mockImplementation(noop);

        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 600;
        init(canvas);

        expect(tileEngine._p).toHaveBeenCalled();
      });
    });

    // --------------------------------------------------
    // tileEngine.sx/sy
    // --------------------------------------------------
    describe('sx/sy', () => {
      let tileEngine;
      beforeEach(() => {
        tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 70,
          height: 70,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });
      });

      if (testContext.TILEENGINE_CAMERA) {
        it('should set sx and sy', () => {
          tileEngine.sx = 10;
          tileEngine.sy = 20;

          expect(tileEngine.sx).toBe(10);
          expect(tileEngine.sy).toBe(20);
        });

        it('should clamp to min of 0', () => {
          tileEngine.sx = -10;
          tileEngine.sy = -20;

          expect(tileEngine.sx).toBe(0);
          expect(tileEngine.sy).toBe(0);
        });

        it('should clamp to max of canvas', () => {
          tileEngine.sx = 1000;
          tileEngine.sy = 2000;

          expect(tileEngine.sx).toBe(100);
          expect(tileEngine.sy).toBe(100);
        });

        it('should clamp to 0 if map size is smaller than canvas', () => {
          tileEngine.mapwidth = 500;
          tileEngine.mapheight = 400;
          tileEngine.sx = 10;
          tileEngine.sy = 20;

          expect(tileEngine.sx).toBe(0);
          expect(tileEngine.sy).toBe(0);
        });
      } else {
        it('should not have sx and sy properties', () => {
          expect(tileEngine.sx).toBeUndefined();
          expect(tileEngine.sy).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.render
    // --------------------------------------------------
    describe('render', () => {
      it('renders the tileEngine', () => {
        let context = getContext();
        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 50,
          height: 50,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });

        jest.spyOn(context, 'drawImage').mockImplementation(noop);
        tileEngine.render();

        expect(context.drawImage).toHaveBeenCalled();
      });

      it('calls prerender if the tile engine is dirty', () => {
        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 50,
          height: 50,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });

        tileEngine._d = false;
        jest.spyOn(tileEngine, '_p').mockImplementation(noop);

        tileEngine.render();

        expect(tileEngine._p).not.toHaveBeenCalled();

        tileEngine._d = true;
        tileEngine.render();

        expect(tileEngine._p).toHaveBeenCalled();
      });

      if (testContext.TILEENGINE_CAMERA) {
        it('should call render on all objects', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 50,
            height: 50,
            tilesets: [
              {
                image: new Image()
              }
            ],
            layers: [
              {
                name: 'test',
                data: [0, 0, 1, 0, 0]
              }
            ]
          });
          let spy = jest.fn();
          let obj = {
            render: spy
          };

          tileEngine.add(obj);
          tileEngine.render();

          expect(spy).toHaveBeenCalled();
        });

        it('should translate by the camera before rendering objects', () => {
          let context = getContext();
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 100,
            height: 100,
            sx: 50,
            sy: 25,
            tilesets: [
              {
                image: new Image()
              }
            ],
            layers: [
              {
                name: 'test',
                data: [0, 0, 1, 0, 0]
              }
            ]
          });
          let spy = jest.spyOn(context, 'translate');

          tileEngine.render();

          expect(spy).toHaveBeenCalledWith(-50, -25);
        });
      } else {
        it('should not translate by the camera', () => {
          let context = getContext();
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 100,
            height: 100,
            sx: 50,
            sy: 25,
            tilesets: [
              {
                image: new Image()
              }
            ],
            layers: [
              {
                name: 'test',
                data: [0, 0, 1, 0, 0]
              }
            ]
          });
          let spy = jest.spyOn(context, 'translate');

          tileEngine.render();

          expect(spy).not.toHaveBeenCalled();
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.layerCollidesWith
    // --------------------------------------------------
    describe('layerCollidesWith', () => {
      let tileEngine;

      beforeEach(() => {
        tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 50,
          height: 50,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });
      });

      if (testContext.TILEENGINE_QUERY) {
        it('should return false if the object does not collide', () => {
          let collides = tileEngine.layerCollidesWith('test', {
            x: 10,
            y: 10,
            height: 10,
            width: 10
          });

          expect(collides).toBe(false);
        });

        it('should return true if the object collides', () => {
          let collides = tileEngine.layerCollidesWith('test', {
            x: 25,
            y: 5,
            height: 10,
            width: 10
          });

          expect(collides).toBe(true);
        });

        it('should handle sprites off the map', () => {
          let collides = tileEngine.layerCollidesWith('test', {
            x: 100,
            y: 100,
            height: 100,
            width: 100
          });

          expect(collides).toBe(false);
        });

        it('should take into account object.anchor', () => {
          let obj = {
            x: 30,
            y: 10,
            height: 10,
            width: 10
          };
          let collides = tileEngine.layerCollidesWith('test', obj);

          expect(collides).toBe(false);

          obj.anchor = {
            x: 0.5,
            y: 0.5
          };
          collides = tileEngine.layerCollidesWith('test', obj);

          expect(collides).toBe(true);
        });
      } else {
        it('should not exist', () => {
          expect(tileEngine.layerCollidesWith).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.tileAtLayer
    // --------------------------------------------------
    describe('tileAtLayer', () => {
      let tileEngine;

      beforeEach(() => {
        tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 50,
          height: 50,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });
      });

      if (testContext.TILEENGINE_QUERY) {
        it('should return the correct tile using x, y coordinates', () => {
          expect(
            tileEngine.tileAtLayer('test', { x: 0, y: 0 })
          ).toBe(0);
          expect(
            tileEngine.tileAtLayer('test', { x: 10, y: 5 })
          ).toBe(0);
          expect(
            tileEngine.tileAtLayer('test', { x: 20, y: 9 })
          ).toBe(1);
          expect(
            tileEngine.tileAtLayer('test', { x: 30, y: 10 })
          ).toBe(undefined);
          expect(
            tileEngine.tileAtLayer('test', { x: 40, y: 1 })
          ).toBe(0);
        });

        it('should return the correct tile using row, col coordinates', () => {
          expect(
            tileEngine.tileAtLayer('test', { row: 0, col: 0 })
          ).toBe(0);
          expect(
            tileEngine.tileAtLayer('test', { row: 0, col: 1 })
          ).toBe(0);
          expect(
            tileEngine.tileAtLayer('test', { row: 0, col: 2 })
          ).toBe(1);
          expect(
            tileEngine.tileAtLayer('test', { row: 1, col: 3 })
          ).toBe(undefined);
          expect(
            tileEngine.tileAtLayer('test', { row: 0, col: 4 })
          ).toBe(0);
        });

        it('should not process out of bound positions', () => {
          expect(
            tileEngine.tileAtLayer('test', { x: -10, y: 0 })
          ).toBe(undefined);
        });

        it('should return -1 if there is no layer by the provided name', () => {
          expect(
            tileEngine.tileAtLayer('foo', { row: 0, col: 0 })
          ).toBe(-1);
        });
      } else {
        it('should not exist', () => {
          expect(tileEngine.tileAtLayer).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.setTileAtLayer
    // --------------------------------------------------
    describe('setTileAtLayer', () => {
      let tileEngine;

      beforeEach(() => {
        tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 50,
          height: 50,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });
      });

      if (testContext.TILEENGINE_DYNAMIC) {
        it('should set the tile using x, y coordinates', () => {
          tileEngine.setTileAtLayer('test', { x: 0, y: 0 }, 5);
          expect(tileEngine.layerMap.test.data[0]).toBe(5);
        });

        it('should set the tile using row, col coordinates', () => {
          tileEngine.setTileAtLayer('test', { row: 1, col: 2 }, 3);
          expect(tileEngine.layerMap.test.data[52]).toBe(3);
        });

        it('should not throw if there is no layer by the provided name', () => {
          function fn() {
            tileEngine.setTileAtLayer('foo', { row: 1, col: 2 }, 3);
          }

          expect(fn).not.toThrow();
        });

        it('should set the dirty flag', () => {
          expect(tileEngine.layerMap.test._d).toBe(false);
          tileEngine.setTileAtLayer('test', { row: 1, col: 2 }, 3);
          expect(tileEngine._d).toBe(true);
          expect(tileEngine.layerMap.test._d).toBe(true);
        });
      } else {
        it('should not exist', () => {
          expect(tileEngine.setTileAtLayer).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.setLayer
    // --------------------------------------------------
    describe('setLayer', () => {
      let tileEngine;

      beforeEach(() => {
        tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 2,
          height: 2,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0]
            }
          ]
        });
      });

      if (testContext.TILEENGINE_DYNAMIC) {
        it('should set each tile on the layer', () => {
          tileEngine.setLayer('test', [1, 2, 3, 4]);
          expect(tileEngine.layerMap.test.data[0]).toBe(1);
          expect(tileEngine.layerMap.test.data[1]).toBe(2);
          expect(tileEngine.layerMap.test.data[2]).toBe(3);
          expect(tileEngine.layerMap.test.data[3]).toBe(4);
        });

        it('should not throw if there is no layer by the provided name', () => {
          function fn() {
            tileEngine.setLayer('foo', [1, 1, 0, 1]);
          }

          expect(fn).not.toThrow();
        });

        it('should set the dirty flag', () => {
          expect(tileEngine.layerMap.test._d).toBe(false);
          tileEngine.setLayer('test', [1, 1, 0, 1]);
          expect(tileEngine._d).toBe(true);
          expect(tileEngine.layerMap.test._d).toBe(true);
        });
      } else {
        it('should not exist', () => {
          expect(tileEngine.setLayer).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.renderLayer
    // --------------------------------------------------
    describe('renderLayer', () => {
      it('should correctly render a layer', () => {
        let image = new Image(100, 100);
        let context = getContext();
        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 2,
          height: 10,
          tilesets: [
            {
              image
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });

        jest.spyOn(context, 'drawImage').mockImplementation(noop);
        tileEngine.renderLayer('test');

        expect(context.drawImage).toHaveBeenCalled();
        expect(context.drawImage).toHaveBeenCalledWith(
            tileEngine.layerCanvases.test,
            0,
            0,
            tileEngine.layerCanvases.test.width,
            tileEngine.layerCanvases.test.height,
            0,
            0,
            tileEngine.layerCanvases.test.width,
            tileEngine.layerCanvases.test.height
        );
      });

      if (testContext.TILEENGINE_CAMERA) {
        it('should account for sx and sy', () => {
          let image = new Image(50, 50);
          let context = getContext();
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 10,
            height: 10,
            tilesets: [
              {
                image
              }
            ],
            layers: [
              {
                name: 'test',
                data: [
                  [],
                  [],
                  [],
                  [],
                  [],
                  [],
                  [],
                  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                  [],
                  []
                ]
              }
            ]
          });

          jest.spyOn(context, 'drawImage').mockImplementation(noop);

          tileEngine.sx = 50;
          tileEngine.sy = 50;

          tileEngine.renderLayer('test');

          expect(context.drawImage).toHaveBeenCalled();
          expect(context.drawImage).toHaveBeenCalledWith(
              tileEngine.layerCanvases.test,
              tileEngine.sx,
              tileEngine.sy,
              tileEngine.layerCanvases.test.width,
              tileEngine.layerCanvases.test.height,
              0,
              0,
              tileEngine.layerCanvases.test.width,
              tileEngine.layerCanvases.test.height
          );
        });
      }

      it('only draws a layer once', () => {
        let image = new Image(100, 100);

        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 2,
          height: 10,
          tilesets: [
            {
              image
            }
          ],
          layers: [
            {
              name: 'test',
              visible: true,
              data: [0, 0, 1, 0, 0]
            }
          ]
        });

        const spy = jest.spyOn(tileEngine, '_rl').mockImplementation(noop);

        tileEngine.renderLayer('test');
        tileEngine.renderLayer('test');

        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('uses the correct tileset', () => {
        let image = new Image(100, 100);

        let called = false;
        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 2,
          height: 10,
          tilesets: [
            {
              firstgid: 1,
              image
            },
            {
              firstgid: 50,
              image
            },
            {
              get firstgid() {
                called = true;
                return 100;
              },
              image
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 49, 0, 0]
            }
          ]
        });

        tileEngine.renderLayer('test');

        expect(called).toBe(true);
      });

      if (testContext.TILEENGINE_DYNAMIC) {
        it('calls render if the layer is dirty', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 50,
            height: 50,
            tilesets: [
              {
                image: new Image()
              }
            ],
            layers: [
              {
                name: 'test',
                data: [0, 0, 1, 0, 0]
              }
            ]
          });

          // Render once to create the canvas
          tileEngine.renderLayer('test');

          tileEngine.layerMap.test._d = false;
          const spy = jest.spyOn(tileEngine, '_rl').mockImplementation(noop);

          tileEngine.renderLayer('test');

          expect(spy).not.toHaveBeenCalled();

          tileEngine.layerMap.test._d = true;
          tileEngine.renderLayer('test');

          expect(spy).toHaveBeenCalled();
        });
      } else {
        it('does not call render if the layer is dirty', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 50,
            height: 50,
            tilesets: [
              {
                image: new Image()
              }
            ],
            layers: [
              {
                name: 'test',
                data: [0, 0, 1, 0, 0]
              }
            ]
          });

          // Render once to create the canvas
          tileEngine.renderLayer('test');

          tileEngine.layerMap.test._d = false;
          const spy = jest.spyOn(tileEngine, '_rl').mockImplementation(noop);

          tileEngine.renderLayer('test');

          expect(spy).not.toHaveBeenCalled();

          tileEngine.layerMap.test._d = true;
          tileEngine.renderLayer('test');

          expect(spy).not.toHaveBeenCalled();
        });
      }

      it('should not error if layer does not have data', () => {
        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 50,
          height: 50,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              objects: []
            }
          ]
        });

        function fn() {
          tileEngine.renderLayer('test');
        }

        expect(fn).not.toThrow();
      });

      it('draws layer with tile spacing', () => {
        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 5,
          height: 5,
          tilesets: [
            {
              spacing: 1,
              firstgid: 1,
              image: new Image(),
              columns: 5
            }
          ],
          layers: [
            {
              name: 'test',
              data: [13]
            }
          ]
        });

        let r = tileEngine._rl.bind(tileEngine);
        let ctx;
        tileEngine._rl = function overrideR(layer, context) {
          ctx = context;
          jest.spyOn(context, 'drawImage').mockImplementation(noop);
          r(layer, context);
        };

        tileEngine.renderLayer('test');

        expect(ctx.drawImage).toHaveBeenCalledWith(
          tileEngine.tilesets[0].image,
          22,
          22,
          10,
          10,
          0,
          0,
          10,
          10
        );
      });

      it('draws layer with tile margin', () => {
        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 5,
          height: 5,
          tilesets: [
            {
              margin: 10,
              firstgid: 1,
              image: new Image(),
              columns: 5
            }
          ],
          layers: [
            {
              name: 'test',
              data: [13]
            }
          ]
        });

        let r = tileEngine._rl.bind(tileEngine);
        let ctx;
        tileEngine._rl = function overrideR(layer, context) {
          ctx = context;
          jest.spyOn(context, 'drawImage').mockImplementation(noop);
          r(layer, context);
        };

        tileEngine.renderLayer('test');

        expect(ctx.drawImage).toHaveBeenCalledWith(
          tileEngine.tilesets[0].image,
          30,
          30,
          10,
          10,
          0,
          0,
          10,
          10
        );
      });

      it('draws layer with tile spacing and margin', () => {
        let tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 5,
          height: 5,
          tilesets: [
            {
              margin: 10,
              spacing: 1,
              firstgid: 1,
              image: new Image(),
              columns: 5
            }
          ],
          layers: [
            {
              name: 'test',
              data: [13]
            }
          ]
        });

        let r = tileEngine._rl.bind(tileEngine);
        let ctx;
        tileEngine._rl = function overrideR(layer, context) {
          ctx = context;
          jest.spyOn(context, 'drawImage').mockImplementation(noop);
          r(layer, context);
        };

        tileEngine.renderLayer('test');

        expect(ctx.drawImage).toHaveBeenCalledWith(
          tileEngine.tilesets[0].image,
          32,
          32,
          10,
          10,
          0,
          0,
          10,
          10
        );
      });

      if (testContext.TILEENGINE_TILED) {
        it('rotates a tile horizontally', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 1,
            height: 1,
            tilesets: [
              {
                firstgid: 1,
                image: new Image(),
                columns: 10
              }
            ],
            layers: [
              {
                name: 'test',
                data: [3 + 0x80000000]
              }
            ]
          });

          let r = tileEngine._rl.bind(tileEngine);
          let ctx;
          tileEngine._rl = function overrideR(layer, context) {
            ctx = context;
            jest.spyOn(context, 'drawImage').mockImplementation(noop);
            jest.spyOn(context, 'translate').mockImplementation(noop);
            jest.spyOn(context, 'scale').mockImplementation(noop);
            r(layer, context);
          };

          tileEngine.renderLayer('test');

          expect(ctx.translate).toHaveBeenCalledWith(10, 0);
          expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
          expect(ctx.drawImage).toHaveBeenCalledWith(
            tileEngine.tilesets[0].image,
            20,
            0,
            10,
            10,
            0,
            0,
            10,
            10
          );
        });

        it('rotates a tile vertically', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 1,
            height: 1,
            tilesets: [
              {
                firstgid: 1,
                image: new Image(),
                columns: 10
              }
            ],
            layers: [
              {
                name: 'test',
                data: [3 + 0x40000000]
              }
            ]
          });

          let r = tileEngine._rl.bind(tileEngine);
          let ctx;
          tileEngine._rl = function overrideR(layer, context) {
            ctx = context;
            jest.spyOn(context, 'drawImage').mockImplementation(noop);
            jest.spyOn(context, 'translate').mockImplementation(noop);
            jest.spyOn(context, 'scale').mockImplementation(noop);
            r(layer, context);
          };

          tileEngine.renderLayer('test');

          expect(ctx.translate).toHaveBeenCalledWith(0, 10);
          expect(ctx.scale).toHaveBeenCalledWith(1, -1);
          expect(ctx.drawImage).toHaveBeenCalledWith(
            tileEngine.tilesets[0].image,
            20,
            0,
            10,
            10,
            0,
            0,
            10,
            10
          );
        });

        it('rotates a tile horizontally and vertically', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 1,
            height: 1,
            tilesets: [
              {
                firstgid: 1,
                image: new Image(),
                columns: 10
              }
            ],
            layers: [
              {
                name: 'test',
                data: [3 + 0x80000000 + 0x40000000]
              }
            ]
          });

          let r = tileEngine._rl.bind(tileEngine);
          let ctx;
          tileEngine._rl = function overrideR(layer, context) {
            ctx = context;
            jest.spyOn(context, 'drawImage').mockImplementation(noop);
            jest.spyOn(context, 'translate').mockImplementation(noop);
            jest.spyOn(context, 'scale').mockImplementation(noop);
            r(layer, context);
          };

          tileEngine.renderLayer('test');

          expect(ctx.translate).toHaveBeenCalledWith(10, 10);
          expect(ctx.scale).toHaveBeenCalledWith(-1, -1);
          expect(ctx.drawImage).toHaveBeenCalledWith(
            tileEngine.tilesets[0].image,
            20,
            0,
            10,
            10,
            0,
            0,
            10,
            10
          );
        });

        it('a tile flipped and turned clockwise', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 1,
            height: 1,
            tilesets: [
              {
                firstgid: 1,
                image: new Image(),
                columns: 10
              }
            ],
            layers: [
              {
                name: 'test',
                data: [3 + 0x80000000 + 0x40000000 + 0x20000000]
              }
            ]
          });

          let r = tileEngine._rl.bind(tileEngine);
          let ctx;
          tileEngine._rl = function overrideR(layer, context) {
            ctx = context;
            jest.spyOn(context, 'drawImage').mockImplementation(noop);
            jest.spyOn(context, 'translate').mockImplementation(noop);
            jest.spyOn(context, 'scale').mockImplementation(noop);
            jest.spyOn(context, 'rotate').mockImplementation(noop);
            r(layer, context);
          };

          tileEngine.renderLayer('test');

          expect(ctx.translate).toHaveBeenCalledWith(5, 5);
          expect(ctx.rotate).toHaveBeenCalledWith(Math.PI / 2);
          expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
          expect(ctx.drawImage).toHaveBeenCalledWith(
            tileEngine.tilesets[0].image,
            20,
            0,
            10,
            10,
            -5,
            -5,
            10,
            10
          );
        });

        it('a tile flipped and turned anticlockwise', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 1,
            height: 1,
            tilesets: [
              {
                firstgid: 1,
                image: new Image(),
                columns: 10
              }
            ],
            layers: [
              {
                name: 'test',
                data: [3 + 0x20000000]
              }
            ]
          });

          let r = tileEngine._rl.bind(tileEngine);
          let ctx;
          tileEngine._rl = function overrideR(layer, context) {
            ctx = context;
            jest.spyOn(context, 'drawImage').mockImplementation(noop);
            jest.spyOn(context, 'translate').mockImplementation(noop);
            jest.spyOn(context, 'scale').mockImplementation(noop);
            jest.spyOn(context, 'rotate').mockImplementation(noop);
            r(layer, context);
          };

          tileEngine.renderLayer('test');

          expect(ctx.translate).toHaveBeenCalledWith(5, 5);
          expect(ctx.rotate).toHaveBeenCalledWith(-Math.PI / 2);
          expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
          expect(ctx.drawImage).toHaveBeenCalledWith(
            tileEngine.tilesets[0].image,
            20,
            0,
            10,
            10,
            -5,
            -5,
            10,
            10
          );
        });
      } else {
        it('does not rotate tile', () => {
          let tileEngine = TileEngine({
            tilewidth: 10,
            tileheight: 10,
            width: 1,
            height: 1,
            tilesets: [
              {
                firstgid: 1,
                image: new Image(),
                columns: 10
              }
            ],
            layers: [
              {
                name: 'test',
                data: [3 + 0x80000000]
              }
            ]
          });

          let r = tileEngine._rl.bind(tileEngine);
          let ctx;
          tileEngine._rl = function overrideR(layer, context) {
            ctx = context;
            jest.spyOn(context, 'drawImage').mockImplementation(noop);
            jest.spyOn(context, 'translate').mockImplementation(noop);
            jest.spyOn(context, 'scale').mockImplementation(noop);
            r(layer, context);
          };

          tileEngine.renderLayer('test');

          expect(ctx.translate).not.toHaveBeenCalled();
          expect(ctx.scale).not.toHaveBeenCalled();
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.objects
    // --------------------------------------------------
    describe('objects', () => {
      let tileEngine = null;

      beforeEach(() => {
        tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 100,
          height: 100,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });
      });

      if (testContext.TILEENGINE_CAMERA) {
        it('should properly handle setting objects', () => {
          tileEngine.add({ foo: 'bar' });
          tileEngine.add({ faz: 'baz' });
          tileEngine.add({ hello: 'world' });

          const removeSpy = jest.spyOn(tileEngine, 'remove');
          const addSpy = jest.spyOn(tileEngine, 'add');
          let child = {
            thing1: 'thing2'
          };

          let oldObjects = tileEngine.objects;
          tileEngine.objects = [child];

          expect(removeSpy).toHaveBeenCalledWith(oldObjects);
          expect(addSpy).toHaveBeenCalledWith([child]);
          expect(tileEngine.objects.length).toBe(1);
          expect(tileEngine.objects[0]).toBe(child);
        });
      } else {
        it('should not have objects', () => {
          expect(tileEngine.objects).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.add
    // --------------------------------------------------
    describe('add', () => {
      let tileEngine = null;
      let obj = null;

      beforeEach(() => {
        tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 100,
          height: 100,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });
        obj = {};
      });

      if (testContext.TILEENGINE_CAMERA) {
        it('should add object', () => {
          expect(tileEngine.objects.length).toBe(0);
          tileEngine.add(obj);
          expect(tileEngine.objects.length).toBe(1);
        });

        it('should add multiple objects', () => {
          tileEngine.add(obj, {});
          expect(tileEngine.objects.length).toBe(2);
        });

        it('should add an array of objects', () => {
          tileEngine.add([obj, {}]);
          expect(tileEngine.objects.length).toBe(2);
        });

        it('should set the objects parent to the tileEngine', () => {
          tileEngine.add(obj);
          expect(obj.parent).toBe(tileEngine);
        });
      } else {
        it('should not exist', () => {
          expect(tileEngine.add).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.remove
    // --------------------------------------------------
    describe('remove', () => {
      let tileEngine = null;
      let obj = null;

      beforeEach(() => {
        tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 100,
          height: 100,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });
        obj = {};
      });

      if (testContext.TILEENGINE_CAMERA) {
        it('should remove object', () => {
          tileEngine.add(obj);
          tileEngine.remove(obj);
          expect(tileEngine.objects.length).toBe(0);
        });

        it('should remove multiple objects', () => {
          let obj2 = {};
          tileEngine.add(obj, obj2);
          tileEngine.remove(obj, obj2);
          expect(tileEngine.objects.length).toBe(0);
        });

        it('should remove an array of objects', () => {
          let obj2 = {};
          tileEngine.add(obj, obj2);
          tileEngine.remove([obj, obj2]);
          expect(tileEngine.objects.length).toBe(0);
        });

        it('should remove the objects parent', () => {
          tileEngine.add(obj);
          tileEngine.remove(obj);
          expect(obj.parent).toBe(null);
        });

        it('should not error if the object was not added before', () => {
          function fn() {
            tileEngine.remove(obj);
          }

          expect(fn).not.toThrow();
        });
      } else {
        it('should not exist', () => {
          expect(tileEngine.remove).toBeUndefined();
        });
      }
    });

    // --------------------------------------------------
    // tileEngine.getPosition
    // --------------------------------------------------
    describe('getPosition', () => {
      let tileEngine,
       canvas;
      beforeEach(() => {
        canvas = getCanvas();
        canvas.style.position = 'absolute';
        canvas.style.left = '0px';
        canvas.style.top = '0px';

        tileEngine = TileEngine({
          tilewidth: 10,
          tileheight: 10,
          width: 100,
          height: 100,
          tilesets: [
            {
              image: new Image()
            }
          ],
          layers: [
            {
              name: 'test',
              data: [0, 0, 1, 0, 0]
            }
          ]
        });
      });

      it('should translate event to position', () => {
        let position = tileEngine.getPosition({ x: 100, y: 100 });

        expect(position).toEqual({
          x: 100,
          y: 100,
          row: 10,
          col: 10
        });
      });

      it('should take into account canvas position', () => {
        canvas.style.left = '100px';
        canvas.style.top = '50px';
        
        // Mock getBoundingClientRect to return the expected position
        // since jsdom doesn't properly handle CSS positioning
        const originalGetBoundingClientRect = canvas.getBoundingClientRect;
        canvas.getBoundingClientRect = jest.fn(() => ({
          x: 100,
          y: 50,
          left: 100,
          top: 50,
          right: 700,
          bottom: 650,
          width: 600,
          height: 600
        }));
        
        let position = tileEngine.getPosition({ x: 100, y: 100 });

        expect(position).toEqual({
          x: 0,
          y: 50,
          row: 5,
          col: 0
        });
        
        // Restore the original method
        canvas.getBoundingClientRect = originalGetBoundingClientRect;
      });

      if (testContext.TILEENGINE_CAMERA) {
        it('should take into account camera', () => {
          tileEngine.sx = 50;
          tileEngine.sy = 100;
          let position = tileEngine.getPosition({ x: 100, y: 100 });
          console.log(position);

          expect(position).toEqual({
            x: 150,
            y: 200,
            row: 20,
            col: 15
          });
        });
      } else {
        it('should not take into account camera', () => {
          tileEngine.sx = 50;
          tileEngine.sy = 100;
          let position = tileEngine.getPosition({ x: 100, y: 100 });

          expect(position).toEqual({
            x: 100,
            y: 100,
            row: 10,
            col: 10
          });
        });
      }
    });
  }
);
