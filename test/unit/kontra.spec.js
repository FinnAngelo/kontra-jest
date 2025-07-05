import * as kontraExports from '../../src/kontra.js';
import kontra from '../../src/kontra.defaults.js';

// --------------------------------------------------
// kontra
// --------------------------------------------------
describe('kontra', () => {
  it('should export animation api and class', () => {
    expect(kontraExports.Animation).toBeDefined();
    expect(kontraExports.AnimationClass).toBeDefined();
  });

  it('should export assets api', () => {
    expect(kontraExports.imageAssets).toBeDefined();
    expect(kontraExports.audioAssets).toBeDefined();
    expect(kontraExports.dataAssets).toBeDefined();
    expect(kontraExports.setImagePath).toBeDefined();
    expect(kontraExports.setAudioPath).toBeDefined();
    expect(kontraExports.setDataPath).toBeDefined();
    expect(kontraExports.loadImage).toBeDefined();
    expect(kontraExports.loadAudio).toBeDefined();
    expect(kontraExports.loadData).toBeDefined();
    expect(kontraExports.load).toBeDefined();
  });

  it('should export button api and class', () => {
    expect(kontraExports.Button).toBeDefined();
    expect(kontraExports.ButtonClass).toBeDefined();
  });

  it('should export core api', () => {
    expect(kontraExports.init).toBeDefined();
    expect(kontraExports.getCanvas).toBeDefined();
    expect(kontraExports.getContext).toBeDefined();
  });

  it('should export events api', () => {
    expect(kontraExports.on).toBeDefined();
    expect(kontraExports.off).toBeDefined();
    expect(kontraExports.emit).toBeDefined();
  });

  it('should export gameLoop api', () => {
    expect(kontraExports.GameLoop).toBeDefined();
  });

  it('should export gameObject api and class', () => {
    expect(kontraExports.GameObject).toBeDefined();
    expect(kontraExports.GameObjectClass).toBeDefined();
  });

  it('should export gamepad api', () => {
    expect(kontraExports.gamepadMap).toBeDefined();
    expect(kontraExports.updateGamepad).toBeDefined();
    expect(kontraExports.initGamepad).toBeDefined();
    expect(kontraExports.onGamepad).toBeDefined();
    expect(kontraExports.offGamepad).toBeDefined();
    expect(kontraExports.gamepadPressed).toBeDefined();
    expect(kontraExports.gamepadAxis).toBeDefined();
  });

  it('should export gesture api', () => {
    expect(kontraExports.gestureMap).toBeDefined();
    expect(kontraExports.initGesture).toBeDefined();
    expect(kontraExports.onGesture).toBeDefined();
    expect(kontraExports.offGesture).toBeDefined();
  });

  it('should export grid api and class', () => {
    expect(kontraExports.Grid).toBeDefined();
    expect(kontraExports.GridClass).toBeDefined();
  });

  it('should export helpers api', () => {
    expect(kontraExports.degToRad).toBeDefined();
    expect(kontraExports.radToDeg).toBeDefined();
    expect(kontraExports.angleToTarget).toBeDefined();
    expect(kontraExports.rotatePoint).toBeDefined();
    expect(kontraExports.movePoint).toBeDefined();
    expect(kontraExports.randInt).toBeDefined();
    expect(kontraExports.seedRand).toBeDefined();
    expect(kontraExports.lerp).toBeDefined();
    expect(kontraExports.inverseLerp).toBeDefined();
    expect(kontraExports.clamp).toBeDefined();
    expect(kontraExports.getStoreItem).toBeDefined();
    expect(kontraExports.setStoreItem).toBeDefined();
    expect(kontraExports.collides).toBeDefined();
    expect(kontraExports.getWorldRect).toBeDefined();
    expect(kontraExports.depthSort).toBeDefined();
  });

  it('should export keyboard api', () => {
    expect(kontraExports.keyMap).toBeDefined();
    expect(kontraExports.initKeys).toBeDefined();
    expect(kontraExports.onKey).toBeDefined();
    expect(kontraExports.offKey).toBeDefined();
    expect(kontraExports.keyPressed).toBeDefined();
  });

  it('should export plugin api', () => {
    expect(kontraExports.registerPlugin).toBeDefined();
    expect(kontraExports.unregisterPlugin).toBeDefined();
    expect(kontraExports.extendObject).toBeDefined();
  });

  it('should export pointer api', () => {
    expect(kontraExports.initPointer).toBeDefined();
    expect(kontraExports.getPointer).toBeDefined();
    expect(kontraExports.track).toBeDefined();
    expect(kontraExports.untrack).toBeDefined();
    expect(kontraExports.pointerOver).toBeDefined();
    expect(kontraExports.onPointer).toBeDefined();
    expect(kontraExports.offPointer).toBeDefined();
    expect(kontraExports.pointerPressed).toBeDefined();
  });

  it('should export pool api and class', () => {
    expect(kontraExports.Pool).toBeDefined();
    expect(kontraExports.PoolClass).toBeDefined();
  });

  it('should export quadtree api and class', () => {
    expect(kontraExports.Quadtree).toBeDefined();
    expect(kontraExports.QuadtreeClass).toBeDefined();
  });

  it('should export random api', () => {
    expect(kontraExports.rand).toBeDefined();
    expect(kontraExports.randInt).toBeDefined();
    expect(kontraExports.getSeed).toBeDefined();
    expect(kontraExports.seedRand).toBeDefined();
  });

  it('should export scene api and class', () => {
    expect(kontraExports.Scene).toBeDefined();
    expect(kontraExports.SceneClass).toBeDefined();
  });

  it('should export sprite api and class', () => {
    expect(kontraExports.Sprite).toBeDefined();
    expect(kontraExports.SpriteClass).toBeDefined();
  });

  it('should export spriteSheet api and class', () => {
    expect(kontraExports.SpriteSheet).toBeDefined();
    expect(kontraExports.SpriteSheetClass).toBeDefined();
  });

  it('should export text api and class', () => {
    expect(kontraExports.Text).toBeDefined();
    expect(kontraExports.TextClass).toBeDefined();
  });

  it('should export tileEngine api and class', () => {
    expect(kontraExports.TileEngine).toBeDefined();
    expect(kontraExports.TileEngineClass).toBeDefined();
  });

  it('should export vector api and class', () => {
    expect(kontraExports.Vector).toBeDefined();
    expect(kontraExports.VectorClass).toBeDefined();
  });

  it('should export kontra object', () => {
    expect(kontraExports.default).toBeDefined();
    expect(kontraExports.default).toEqual(kontra);
  });
});
