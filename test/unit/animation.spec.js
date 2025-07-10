import Animation, { AnimationClass } from '../../src/animation.js';
import { getContext } from '../../src/core.js';

// --------------------------------------------------
// animation
// --------------------------------------------------
describe('animation', () => {
  let animation;

  beforeEach(() => {
    animation = Animation({
      name: 'walk',
      frames: [1, 2, 3, 4],
      frameRate: 30,
      spriteSheet: {
        image: new Image(),
        _f: 2,
        frame: {
          width: 5,
          height: 5,
          margin: 0,
          spacing: 0
        }
      }
    });
  });

  it('should export class', () => {
    expect(typeof AnimationClass).toBe('function');
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should set properties on the animation', () => {
      expect(animation.name).toBe('walk');
      expect(animation.frames).toEqual([1, 2, 3, 4]);
      expect(animation.frameRate).toBe(30);
      expect(animation.width).toBe(5);
      expect(animation.height).toBe(5);
      expect(animation.loop).toBe(true);
      expect(animation.margin).toBe(0);
      expect(animation.spacing).toBe(0);
      expect(animation.isStopped).toBe(false);
    });
  });

  // --------------------------------------------------
  // clone
  // --------------------------------------------------
  describe('clone', () => {
    it('should return a new animation with the same properties', () => {
      let anim = animation.clone();

      expect(anim).not.toBe(animation);
      expect(anim).toEqual(animation);
    });
  });

  // --------------------------------------------------
  // reset
  // --------------------------------------------------
  describe('reset', () => {
    it('should reset the animation', () => {
      animation._f = 4;
      animation._a = 4;

      animation.reset();

      expect(animation._f).toBe(0);
      expect(animation._a).toBe(0);
    });
  });

  // --------------------------------------------------
  // start
  // --------------------------------------------------
  describe('start', () => {
    it('should start the animation', () => {
      animation.start();

      expect(animation.isStopped).toBe(false);
    });

    it("should reset if the animation doesn't loop", () => {
      animation.loop = false;
      const resetSpy = jest.spyOn(animation, 'reset');
      animation.start();

      expect(resetSpy).toHaveBeenCalled();
    });

    it('should not reset if the animation loops', () => {
      animation.loop = true;
      const resetSpy = jest.spyOn(animation, 'reset');
      animation.start();

      expect(resetSpy).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // stop
  // --------------------------------------------------
  describe('stop', () => {
    it('should stop the animation', () => {
      animation.start();
      animation.stop();

      expect(animation.isStopped).toBe(true);
    });
  });

  // --------------------------------------------------
  // update
  // --------------------------------------------------
  describe('update', () => {
    it('should not update the current frame if not enough time has passed', () => {
      animation.update();

      expect(animation._f).toBe(0);
    });

    it('should take no parameter and update the current frame correctly', () => {
      for (let i = 0; i < 3; i++) {
        animation.update();
      }

      expect(animation._f).toBe(1);
    });

    it('should take dt as a parameter and update the current frame correctly', () => {
      animation.update(1 / 30);

      expect(animation._f).toBe(1);
    });

    it('should restart the animation when finished', () => {
      for (let i = 0; i < 7; i++) {
        animation.update();
      }

      expect(animation._f).toBe(3);

      animation.update();

      expect(animation._f).toBe(0);
    });

    it('should not restart the animation if loop is false', () => {
      animation.loop = false;

      for (let i = 0; i < 7; i++) {
        animation.update();
      }

      expect(animation._f).toBe(3);

      animation.update();

      expect(animation._f).toBe(3);
      expect(animation.isStopped).toBe(true);
    });

    it('should not update the animation if is stopped', () => {
      animation.stop();

      for (let i = 0; i < 10; i++) {
        animation.update();
      }

      expect(animation._f).toBe(0);
    });
  });

  // --------------------------------------------------
  // render
  // --------------------------------------------------
  describe('render', () => {
    it('should render the spriteSheet at its initial frame', () => {
      let context = { drawImage: jest.fn() };

      animation.render({
        x: 10,
        y: 10,
        context
      });

      expect(context.drawImage).toHaveBeenCalled();
      expect(context.drawImage).toHaveBeenCalledWith(
        animation.spriteSheet.image,
        5,
        0,
        5,
        5,
        10,
        10,
        5,
        5
      );
    });

    it('should use the default context', () => {
      let context = getContext();
      jest.spyOn(context, 'drawImage');

      animation.render({
        x: 10,
        y: 10
      });

      expect(context.drawImage).toHaveBeenCalled();
    });

    it('should render the spriteSheet in the middle of the animation', () => {
      let context = { drawImage: jest.fn() };

      animation._f = 2;

      animation.render({
        x: 10,
        y: 10,
        context
      });

      expect(context.drawImage).toHaveBeenCalled();
      expect(context.drawImage).toHaveBeenCalledWith(
        animation.spriteSheet.image,
        5,
        5,
        5,
        5,
        10,
        10,
        5,
        5
      );
    });

    it('should render the spriteSheet with spacing', () => {
      let context = { drawImage: jest.fn() };

      animation._f = 2;
      animation.spacing = 1;

      animation.render({
        x: 10,
        y: 10,
        context
      });

      expect(context.drawImage).toHaveBeenCalled();
      expect(context.drawImage).toHaveBeenCalledWith(
        animation.spriteSheet.image,
        8,
        8,
        5,
        5,
        10,
        10,
        5,
        5
      );
    });

    it('should render the spriteSheet with margin', () => {
      let context = { drawImage: jest.fn() };

      animation._f = 2;
      animation.margin = 5;

      animation.render({
        x: 10,
        y: 10,
        context
      });

      expect(context.drawImage).toHaveBeenCalled();
      expect(context.drawImage).toHaveBeenCalledWith(
        animation.spriteSheet.image,
        10,
        10,
        5,
        5,
        10,
        10,
        5,
        5
      );
    });

    it('should render the spriteSheet with spacing and margin', () => {
      let context = { drawImage: jest.fn() };

      animation._f = 2;
      animation.spacing = 1;
      animation.margin = 5;

      animation.render({
        x: 10,
        y: 10,
        context
      });

      expect(context.drawImage).toHaveBeenCalled();
      expect(context.drawImage).toHaveBeenCalledWith(
        animation.spriteSheet.image,
        13,
        13,
        5,
        5,
        10,
        10,
        5,
        5
      );
    });
  });
});
