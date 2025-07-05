import Sprite from '../../src/sprite.js';
import TileEngine from '../../src/tileEngine.js';
import GameLoop from '../../src/gameLoop.js';
import Text from '../../src/text.js';
import Scene from '../../src/scene.js';
import { _reset, init } from '../../src/core.js';
import { noop } from '../../src/utils.js';

describe('core integration', () => {
  beforeEach(() => {
    _reset();
  });

  it('should allow calling init after creating objects', () => {
    let sprite = Sprite({
      x: 10,
      y: 20,
      width: 10,
      height: 20,
      color: 'red'
    });
    let loop = GameLoop({
      update: noop,
      render: noop
    });
    let text = Text({ text: 'Hello World' });
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

    let scene = Scene({
      id: 'myId',
      objects: [sprite, text]
    });

    expect(() => scene.lookAt(sprite)).not.toThrow();

    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = 600;
    init(canvas);

    expect(() => sprite.render()).not.toThrow();
    expect(() => text.render()).not.toThrow();
    expect(() => tileEngine.render()).not.toThrow();
    expect(() => scene.render()).not.toThrow();

    loop._last = performance.now() - (1e3 / 60) * 2.5;
    expect(() => loop._frame()).not.toThrow();
  });
});