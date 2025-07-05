// Import setup for browser API mocks
import '../setup-assets.js';
import * as assets from '../../src/assets.js';
import { on, off } from '../../src/events.js';

// --------------------------------------------------
// assets
// --------------------------------------------------
describe('assets', () => {
  beforeEach(() => {
    assets._reset();
    jest.clearAllMocks();
  });

  afterEach(() => {
    assets._reset();
  });

  it('should export api', () => {
    expect(assets.imageAssets).toBeInstanceOf(Object);
    expect(assets.audioAssets).toBeInstanceOf(Object);
    expect(assets.dataAssets).toBeInstanceOf(Object);
    expect(assets.setImagePath).toBeInstanceOf(Function);
    expect(assets.setAudioPath).toBeInstanceOf(Function);
    expect(assets.setDataPath).toBeInstanceOf(Function);
    expect(assets.loadImage).toBeInstanceOf(Function);
    expect(assets.loadAudio).toBeInstanceOf(Function);
    expect(assets.loadData).toBeInstanceOf(Function);
    expect(assets.load).toBeInstanceOf(Function);
  });

  // --------------------------------------------------
  // loadImage
  // --------------------------------------------------
  describe('loadImage', () => {
    beforeEach(() => {
      // Mock successful image loading
      global.fetch = jest.fn(() => 
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob())
        })
      );
      
      // Mock Image constructor with proper event handling
      global.Image = function ImageMock() {
        const img = {
          addEventListener: jest.fn((event, handler) => {
            if (event === 'load') {
              img._loadHandler = handler;
            } else if (event === 'error') {
              img._errorHandler = handler;
            }
          }),
          _src: '',
          _loadHandler: null,
          _errorHandler: null,
          _onload: null,
          _onerror: null,
          get onload() {
            return this._onload;
          },
          set onload(handler) {
            this._onload = handler;
          },
          get onerror() {
            return this._onerror;
          },
          set onerror(handler) {
            this._onerror = handler;
          },
          get src() {
            return this._src;
          },
          set src(value) {
            this._src = value;
            // Simulate image loading
            setTimeout(() => {
              if (this._onload) {
                this._onload();
              } else if (this._loadHandler) {
                this._loadHandler();
              }
            }, 10);
          }
        };
        return img;
      };
    });

    it('should load an image and resolve with it', async () => {
      const image = await assets.loadImage('/imgs/bullet.png');
      
      expect(assets.imageAssets['/imgs/bullet.png']).toBe(image);
      expect(assets.imageAssets['/imgs/bullet']).toBe(image);
    });

    it('should resolve with the image if it is already loaded', async () => {
      await assets.loadImage('/imgs/bullet.png');
      
      const spy = jest.spyOn(global, 'Image');
      await assets.loadImage('/imgs/bullet.png');
      
      expect(spy).not.toHaveBeenCalled();
      
      spy.mockRestore();
    });

    it('should load an image using imagePath', async () => {
      assets.setImagePath('/imgs');

      const image = await assets.loadImage('bullet.png');
      
      expect(assets.imageAssets['/imgs/bullet.png']).toBe(image);
      expect(assets.imageAssets['bullet']).toBe(image);
    });

    it('should correctly join a relative image path', async () => {
      const image = await assets.loadImage('../imgs/bullet.png');
      
      expect(assets.imageAssets['../imgs/bullet.png']).toBe(image);
      expect(assets.imageAssets['../imgs/bullet']).toBe(image);
    });

    it('should correctly join an image path', async () => {
      assets.setImagePath('/imgs/');

      const image = await assets.loadImage('/bullet.png');
      
      expect(assets.imageAssets['/imgs/bullet.png']).toBe(image);
      expect(assets.imageAssets['bullet']).toBe(image);
    });

    it('should throw an error if an image failed to load', async () => {
      // Mock the Image constructor to simulate an error
      const originalImage = global.Image;
      global.Image = jest.fn(() => {
        const img = {
          addEventListener: jest.fn((event, handler) => {
            if (event === 'error') {
              img._errorHandler = handler;
            }
          }),
          _src: '',
          _onload: null,
          _onerror: null,
          _errorHandler: null,
          get onload() {
            return this._onload;
          },
          set onload(handler) {
            this._onload = handler;
          },
          get onerror() {
            return this._onerror;
          },
          set onerror(handler) {
            this._onerror = handler;
          },
          get src() {
            return this._src;
          },
          set src(value) {
            this._src = value;
            // Simulate image loading error
            setTimeout(() => {
              if (this._onerror) {
                this._onerror();
              } else if (this._errorHandler) {
                this._errorHandler();
              }
            }, 10);
          }
        };
        return img;
      });

      await expect(assets.loadImage('fake.png')).rejects.toBeDefined();
      
      global.Image = originalImage;
    });

    it('should emit the assetLoaded event', async () => {
      const loaded = jest.fn();
      on('assetLoaded', loaded);
      
      const image = await assets.loadImage('/imgs/bullet.png');
      
      expect(loaded).toHaveBeenCalledWith(image, '/imgs/bullet.png');
      off('assetLoaded', loaded);
    });
  });

  // --------------------------------------------------
  // loadData
  // --------------------------------------------------
  describe('loadData', () => {
    beforeEach(() => {
      // Mock successful data loading with proper Response object
      const createMockResponse = (url) => {
        const mockResponse = {
          ok: true,
          clone: jest.fn().mockReturnValue({
            ok: true,
            json: jest.fn(() => {
              if (url.includes('.json')) {
                return Promise.resolve({ test: 'data' });
              }
              return Promise.reject(new Error('Not JSON'));
            }),
            text: jest.fn(() => {
              if (url.includes('.json')) {
                return Promise.resolve('{"test":"data"}');
              }
              return Promise.resolve('test data content');
            })
          }),
          json: jest.fn(() => {
            if (url.includes('.json')) {
              return Promise.resolve({ test: 'data' });
            }
            return Promise.reject(new Error('Not JSON'));
          }),
          text: jest.fn(() => {
            if (url.includes('.json')) {
              return Promise.resolve('{"test":"data"}');
            }
            return Promise.resolve('test data content');
          })
        };
        return mockResponse;
      };

      global.fetch = jest.fn((url) => Promise.resolve(createMockResponse(url)));
    });

    it('should load the data and resolve with it', async () => {
      const data = await assets.loadData('/data/test.txt');
      
      expect(typeof data).toBe('string');
      expect(assets.dataAssets['/data/test.txt']).toBe(data);
      expect(assets.dataAssets['/data/test']).toBe(data);
    });

    it('should resolve with the data if it is already loaded', async () => {
      await assets.loadData('/data/test.txt');
      
      // Clear the mock and spy on fetch to ensure it's not called again
      jest.clearAllMocks();
      const spy = jest.spyOn(global, 'fetch');
      
      await assets.loadData('/data/test.txt');
      
      expect(spy).not.toHaveBeenCalled();
      
      spy.mockRestore();
    });

    it('should parse a JSON file', async () => {
      const data = await assets.loadData('/data/test.json');
      
      expect(typeof data).toBe('object');
      expect(assets.dataAssets['/data/test.json']).toBe(data);
      expect(assets.dataAssets['/data/test']).toBe(data);
    });

    it('should load the data using dataPath', async () => {
      assets.setDataPath('/data');

      const data = await assets.loadData('test.txt');
      
      expect(assets.dataAssets['/data/test.txt']).toBe(data);
      expect(assets.dataAssets['test']).toBe(data);
    });

    it('should correctly join the data path', async () => {
      assets.setDataPath('/data/');

      const data = await assets.loadData('/test.txt');
      
      expect(assets.dataAssets['/data/test.txt']).toBe(data);
      expect(assets.dataAssets['test']).toBe(data);
    });

    it('should throw an error if the data failed to load', async () => {
      // Mock a failed response that the code will actually reject
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
      
      await expect(assets.loadData('fake.txt')).rejects.toThrow();
    });

    it('should emit the assetLoaded event', async () => {
      const loaded = jest.fn();
      on('assetLoaded', loaded);
      
      const data = await assets.loadData('/data/test.txt');
      
      expect(loaded).toHaveBeenCalledWith(data, '/data/test.txt');
      off('assetLoaded', loaded);
    });
  });

  // --------------------------------------------------
  // loadAudio
  // --------------------------------------------------
  describe('loadAudio', () => {
    beforeEach(() => {
      // Reset Audio constructor mock for proper testing
      global.Audio = function AudioMock() {
        const audio = {
          addEventListener: jest.fn((event, handler) => {
            if (event === 'canplay' || event === 'canplaythrough') {
              audio._loadHandler = handler;
            } else if (event === 'error') {
              audio._errorHandler = handler;
            }
          }),
          canPlayType: jest.fn((type) => {
            if (type.includes('mp3') || type.includes('mpeg')) return 'probably';
            if (type.includes('ogg') || type.includes('vorbis')) return 'probably';
            if (type.includes('wav')) return 'probably';
            if (type.includes('aac')) return 'probably';
            return ''; // Return empty string for unsupported formats
          }),
          load: jest.fn(),
          _src: '',
          _loadHandler: null,
          _errorHandler: null,
          get src() {
            return this._src;
          },
          set src(value) {
            this._src = value;
            // Simulate audio loading - only trigger load if format is supported
            const extension = value.split('.').pop();
            const canPlay = this.canPlayType(`audio/${extension};`);
            setTimeout(() => {
              if (canPlay && this._loadHandler) {
                this._loadHandler();
              } else if (!canPlay && this._errorHandler) {
                this._errorHandler();
              }
            }, 10);
          }
        };
        return audio;
      };
      
      // Set up Audio prototype for spying
      global.Audio.prototype = {
        addEventListener: jest.fn(),
        canPlayType: jest.fn(),
        load: jest.fn()
      };
    });

    it('should load the audio and resolve with it', async () => {
      const audio = await assets.loadAudio('/audio/shoot.mp3');
      
      expect(assets.audioAssets['/audio/shoot.mp3']).toBe(audio);
      expect(assets.audioAssets['/audio/shoot']).toBe(audio);
    });

    it('should resolve with the audio if it is already loaded', async () => {
      await assets.loadAudio('/audio/shoot.mp3');
      
      const spy = jest.spyOn(Audio.prototype, 'addEventListener');
      await assets.loadAudio('/audio/shoot.mp3');
      
      expect(spy).not.toHaveBeenCalled();
      
      spy.mockRestore();
    });

    it('should load the correct audio file based on browser support (mp3)', async () => {
      assets._setCanPlayFn(() => {
        return {
          mp3: true,
          ogg: false
        };
      });

      const audio = await assets.loadAudio(['/audio/shoot.ogg', '/audio/shoot.mp3']);
      
      expect(assets.audioAssets['/audio/shoot.mp3']).toBe(audio);
      expect(assets.audioAssets['/audio/shoot']).toBe(audio);
    });

    it('should load the correct audio file based on browser support (ogg)', async () => {
      assets._setCanPlayFn(() => {
        return {
          mp3: false,
          ogg: true
        };
      });

      const audio = await assets.loadAudio(['/audio/shoot.ogg', '/audio/shoot.mp3']);
      
      expect(assets.audioAssets['/audio/shoot.ogg']).toBe(audio);
      expect(assets.audioAssets['/audio/shoot']).toBe(audio);
    });

    it('should load the first supported auto file in the array', async () => {
      assets._setCanPlayFn(() => {
        return {
          mp3: true,
          ogg: true
        };
      });

      const audio = await assets.loadAudio(['/audio/shoot.ogg', '/audio/shoot.mp3']);
      
      expect(audio.src.endsWith('/audio/shoot.ogg')).toBe(true);
    }, 10000);

    it('should load the audio using audioPath', async () => {
      assets.setAudioPath('/audio');

      const audio = await assets.loadAudio('shoot.mp3');
      
      expect(assets.audioAssets['/audio/shoot.mp3']).toBe(audio);
      expect(assets.audioAssets['shoot']).toBe(audio);
    });

    it('should correctly join the audio path', async () => {
      assets.setAudioPath('/audio/');

      const audio = await assets.loadAudio('/shoot.mp3');
      
      expect(assets.audioAssets['/audio/shoot.mp3']).toBe(audio);
      expect(assets.audioAssets['shoot']).toBe(audio);
    });

    it('should throw an error if the audio failed to load', async () => {
      // Mock Audio to simulate error
      global.Audio = jest.fn(() => {
        const audio = {
          addEventListener: jest.fn((event, handler) => {
            if (event === 'error') {
              setTimeout(() => handler(), 0);
            }
          }),
          load: jest.fn(),
          src: ''
        };
        return audio;
      });

      await expect(assets.loadAudio('fake.mp3')).rejects.toThrow();
    });

    it('should throw an error if no audio source can be played', async () => {
      await expect(assets.loadAudio('cantPlay.aaa')).rejects.toBeDefined();
    });

    it('should emit the assetLoaded event', async () => {
      const loaded = jest.fn();
      on('assetLoaded', loaded);
      
      const audio = await assets.loadAudio('/audio/shoot.mp3');
      
      expect(loaded).toHaveBeenCalledWith(audio, '/audio/shoot.mp3');
      off('assetLoaded', loaded);
    });
  });

  // --------------------------------------------------
  // load
  // --------------------------------------------------
  describe('load', () => {
    it('should load an image asset', async () => {
      expect(assets.imageAssets).toEqual({});

      const loadedAssets = await assets.load('/imgs/bullet.png');
      
      expect(assets.imageAssets['/imgs/bullet']).toBe(loadedAssets[0]);
    });

    it('should load an audio asset', async () => {
      expect(assets.audioAssets).toEqual({});

      const loadedAssets = await assets.load(['/audio/shoot.mp3', '/audio/shoot.ogg']);
      
      expect(assets.audioAssets['/audio/shoot']).toBe(loadedAssets[0]);
    });

    it('should load an data asset', async () => {
      expect(assets.dataAssets).toEqual({});

      const loadedAssets = await assets.load('/data/test.json');
      
      expect(assets.dataAssets['/data/test']).toBe(loadedAssets[0]);
    });

    it('should load multiple assets', async () => {
      const loadedAssets = await assets.load(
        '/imgs/bullet.png',
        ['/audio/shoot.mp3', '/audio/shoot.ogg'],
        '/data/test.json'
      );
      
      expect(loadedAssets).toHaveLength(3);
    });
  });
});
