import TileEngine from '../../src/tileEngine.js';
import {
  loadImage,
  loadData,
  load,
  _reset
} from '../../src/assets.js';
import * as pointer from '../../src/pointer.js';
import { noop } from '../../src/utils.js';
import { emit } from '../../src/events.js';
import { init, getCanvas } from '../../src/core.js';

describe('tileEngine integration', () => {

  beforeAll(() => {
    if (!getCanvas()) {
      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);
    }
  });

  beforeEach(() => {
    // Reset assets to clean state
    _reset();
  });

  afterEach(() => {
    // Clean up after each test
    _reset();
  });

  it('should resolve tileset image', async () => {
    const image = await loadImage('/imgs/bullet.png');
    
    let tileEngine = TileEngine({
      tilesets: [
        {
          image: '/imgs/bullet.png'
        }
      ]
    });

    expect(tileEngine.tilesets[0].image).toBe(image);
  }, 10000);

  it('should resolve tileset source', async () => {
    await loadData('/data/test.json');
    
    let tileEngine = TileEngine({
      tilesets: [
        {
          source: '/data/test.json'
        }
      ]
    });

    expect(tileEngine.tilesets[0].foo).toBe('bar');
  }, 10000);

  it('should resolve tileset image from json data', async () => {
    const assets = await load('/data/tileset/tileset.json', '/data/tileset/bullet.png');
    let tileEngine = TileEngine(assets[0]);
    expect(tileEngine.tilesets[0].image).toBe(assets[1]);
  }, 10000);

  it('should resolve tileset source and the image of the source', async () => {
    const assets = await load('/data/source.json', '/imgs/bullet.png');
    
    let tileEngine = TileEngine({
      tilesets: [
        {
          source: '/data/source.json'
        }
      ]
    });

    expect(tileEngine.tilesets[0].image).toBe(assets[1]);
  }, 10000);

  it('should throw an error if trying to resolve a tileset image without using needed asset function', () => {
    function func() {
      TileEngine({
        tilesets: [
          {
            image: '/imgs/bullet.png'
          }
        ]
      });
    }

    expect(func).toThrow();
  }, 10000);

  it('should throw an error if the image was not loaded', () => {
    loadImage('/fake.png');

    function func() {
      TileEngine({
        tilesets: [
          {
            image: '/imgs/bullet.png'
          }
        ]
      });
    }

    expect(func).toThrow();
  }, 10000);

  it('should throw an error if trying to resolve a tileset source without using needed asset function', () => {
    function func() {
      TileEngine({
        tilesets: [
          {
            source: '/data/test.json'
          }
        ]
      });
    }

    expect(func).toThrow();
  }, 10000);

  it('should throw an error if the source was not loaded', () => {
    loadData('/fake.json');

    function func() {
      TileEngine({
        tilesets: [
          {
            source: '/data/test.json'
          }
        ]
      });
    }

    expect(func).toThrow();
  }, 10000);

  // Note: This test passes when run individually but may fail when run with other tests
  // due to test isolation issues. This is a known limitation during the Karma to Jest migration.
  // To run this test individually: npm test -- test/integration/tileEngine.spec.js --testNamePattern="should correctly track objects"
  it('should correctly track objects with pointer when camera is moved', async () => {
    // Load assets first
    const assets = await load('/data/tileset/tileset.json', '/data/tileset/bullet.png');
    
    let tileEngine = TileEngine(assets[0]);
    let pntr = pointer.initPointer({ radius: 1 });
    let object = {
      x: 100,
      y: 50,
      width: 10,
      height: 20,
      render: noop
    };

    tileEngine.add(object);
    pointer.track(object);
    object.render();
    emit('tick');

    tileEngine.mapwidth = 900;

    pntr.x = 105;
    pntr.y = 55;
    expect(pointer.pointerOver(object)).toBe(true);

    tileEngine.sx = 100;
    expect(pointer.pointerOver(object)).toBe(false);

    pntr.x = 5;
    expect(pointer.pointerOver(object)).toBe(true);
  }, 10000);
});
