import kontra from '../../src/kontra.defaults.js';

// --------------------------------------------------
// kontra.defaults
// --------------------------------------------------
describe('kontra.defaults', () => {
  it('should add animation api and class', () => {
    expect(kontra.Animation).toBeDefined();
    expect(kontra.AnimationClass).toBeDefined();
  });

  it('should add assets api', () => {
    expect(kontra.imageAssets).toBeDefined();
    expect(kontra.audioAssets).toBeDefined();
    expect(kontra.dataAssets).toBeDefined();
    expect(kontra.setImagePath).toBeDefined();
    expect(kontra.setAudioPath).toBeDefined();
    expect(kontra.setDataPath).toBeDefined();
    expect(kontra.loadImage).toBeDefined();
    expect(kontra.loadAudio).toBeDefined();
    expect(kontra.loadData).toBeDefined();
    expect(kontra.load).toBeDefined();
  });

  it('should add button api and class', () => {
    expect(kontra.Button).toBeDefined();
    expect(kontra.ButtonClass).toBeDefined();
  });

  it('should add core api', () => {
    expect(kontra.init).toBeDefined();
    expect(kontra.getCanvas).toBeDefined();
    expect(kontra.getContext).toBeDefined();
  });

  it('should add events api', () => {
    expect(kontra.on).toBeDefined();
    expect(kontra.off).toBeDefined();
    expect(kontra.emit).toBeDefined();
  });

  it('should add gameLoop api', () => {
    expect(kontra.GameLoop).toBeDefined();
  });

  it('should add gameObject api and class', () => {
    expect(kontra.GameObject).toBeDefined();
    expect(kontra.GameObjectClass).toBeDefined();
  });

  it('should add gamepad api', () => {
    expect(kontra.gamepadMap).toBeDefined();
    expect(kontra.updateGamepad).toBeDefined();
    expect(kontra.initGamepad).toBeDefined();
    expect(kontra.onGamepad).toBeDefined();
    expect(kontra.offGamepad).toBeDefined();
    expect(kontra.gamepadPressed).toBeDefined();
    expect(kontra.gamepadAxis).toBeDefined();
  });

  it('should add gesture api', () => {
    expect(kontra.gestureMap).toBeDefined();
    expect(kontra.initGesture).toBeDefined();
    expect(kontra.onGesture).toBeDefined();
    expect(kontra.offGesture).toBeDefined();
  });

  it('should add grid api and class', () => {
    expect(kontra.Grid).toBeDefined();
    expect(kontra.GridClass).toBeDefined();
  });

  it('should add helpers api', () => {
    expect(kontra.degToRad).toBeDefined();
    expect(kontra.radToDeg).toBeDefined();
    expect(kontra.angleToTarget).toBeDefined();
    expect(kontra.rotatePoint).toBeDefined();
    expect(kontra.movePoint).toBeDefined();
    expect(kontra.lerp).toBeDefined();
    expect(kontra.inverseLerp).toBeDefined();
    expect(kontra.clamp).toBeDefined();
    expect(kontra.getStoreItem).toBeDefined();
    expect(kontra.setStoreItem).toBeDefined();
    expect(kontra.collides).toBeDefined();
    expect(kontra.getWorldRect).toBeDefined();
    expect(kontra.depthSort).toBeDefined();
  });

  it('should add keyboard api', () => {
    expect(kontra.keyMap).toBeDefined();
    expect(kontra.initKeys).toBeDefined();
    expect(kontra.onKey).toBeDefined();
    expect(kontra.offKey).toBeDefined();
    expect(kontra.keyPressed).toBeDefined();
  });

  it('should add plugin api', () => {
    expect(kontra.registerPlugin).toBeDefined();
    expect(kontra.unregisterPlugin).toBeDefined();
    expect(kontra.extendObject).toBeDefined();
  });

  it('should add pointer api', () => {
    expect(kontra.initPointer).toBeDefined();
    expect(kontra.getPointer).toBeDefined();
    expect(kontra.track).toBeDefined();
    expect(kontra.untrack).toBeDefined();
    expect(kontra.pointerOver).toBeDefined();
    expect(kontra.onPointer).toBeDefined();
    expect(kontra.offPointer).toBeDefined();
    expect(kontra.pointerPressed).toBeDefined();
  });

  it('should add pool api and class', () => {
    expect(kontra.Pool).toBeDefined();
    expect(kontra.PoolClass).toBeDefined();
  });

  it('should add quadtree api and class', () => {
    expect(kontra.Quadtree).toBeDefined();
    expect(kontra.QuadtreeClass).toBeDefined();
  });

  it('should add random api', () => {
    expect(kontra.rand).toBeDefined();
    expect(kontra.randInt).toBeDefined();
    expect(kontra.getSeed).toBeDefined();
    expect(kontra.seedRand).toBeDefined();
  });

  it('should add scene api and class', () => {
    expect(kontra.Scene).toBeDefined();
    expect(kontra.SceneClass).toBeDefined();
  });

  it('should add sprite api and class', () => {
    expect(kontra.Sprite).toBeDefined();
    expect(kontra.SpriteClass).toBeDefined();
  });

  it('should add spriteSheet api and class', () => {
    expect(kontra.SpriteSheet).toBeDefined();
    expect(kontra.SpriteSheetClass).toBeDefined();
  });

  it('should add text api and class', () => {
    expect(kontra.Text).toBeDefined();
    expect(kontra.TextClass).toBeDefined();
  });

  it('should add tileEngine api and class', () => {
    expect(kontra.TileEngine).toBeDefined();
    expect(kontra.TileEngineClass).toBeDefined();
  });

  it('should add vector api and class', () => {
    expect(kontra.Vector).toBeDefined();
    expect(kontra.VectorClass).toBeDefined();
  });
});
