import * as random from '../../src/random.js';

// --------------------------------------------------
// random
// --------------------------------------------------
describe('random', () => {
  it('should export api', () => {
    expect(typeof random.rand).toBe('function');
    expect(typeof random.randInt).toBe('function');
    expect(typeof random.getSeed).toBe('function');
    expect(typeof random.seedRand).toBe('function');
  });

  // --------------------------------------------------
  // rand
  // --------------------------------------------------
  describe('rand', () => {
    it('should get random value between 0 and <1', () => {
      const value = random.rand();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });

    it('should work if seed has not been seeded', () => {
      random._reset();
      expect(random.rand).not.toThrow();
    });
  });

  // --------------------------------------------------
  // randInt
  // --------------------------------------------------
  describe('randInt', () => {
    it('should get random integer between range', () => {
      const value = random.randInt(2, 10);
      expect(value).toBeGreaterThanOrEqual(2);
      expect(value).toBeLessThanOrEqual(10);
    });
  });

  // --------------------------------------------------
  // seedRand
  // --------------------------------------------------
  describe('seedRand', () => {
    function testSeededRandom() {
      expect(random.rand()).toBe(0.26133555523119867);

      for (let i = 0; i < 20; i++) {
        random.rand();
      }

      expect(random.rand()).toBe(0.08834491996094584);
    }

    // all seed values = 2859059487
    it('should seed with value', () => {
      random.seedRand(2859059487);

      testSeededRandom();
    });

    it('should seed with string', () => {
      random.seedRand('kontra');

      testSeededRandom();
    });

    it('should seed with time by default', () => {
      jest.spyOn(Date, 'now').mockReturnValue(2859059487);
      random.seedRand();

      testSeededRandom();
    });
  });

  // --------------------------------------------------
  // getSeed
  // --------------------------------------------------
  describe('getSeed', () => {
    it('should return the seed', () => {
      random.seedRand('kontra');
      expect(random.getSeed()).toBe(2859059487);
    });
  });
});
