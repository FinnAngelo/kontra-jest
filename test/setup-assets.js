// Browser API mocks for assets testing
// This file sets up mocks for Image, Audio, and fetch APIs that jsdom doesn't fully implement

// Mock Audio constructor with all required methods
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
      // Mock browser audio format support
      if (type.includes('mp3') || type.includes('mpeg')) return 'probably';
      if (type.includes('ogg') || type.includes('vorbis')) return 'probably';
      if (type.includes('wav')) return 'probably';
      if (type.includes('aac')) return 'probably';
      return '';
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
      // Simulate audio loading
      setTimeout(() => {
        if (this._loadHandler) {
          this._loadHandler();
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

// Mock Image constructor
global.Image = function ImageMock(width, height) {
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
    width: width || 0,
    height: height || 0,
    get src() {
      return this._src;
    },
    set src(value) {
      this._src = value;
      // Simulate image loading
      setTimeout(() => {
        if (this._loadHandler) {
          this._loadHandler();
        }
      }, 10);
    }
  };
  return img;
};

// Mock fetch with proper Response object including clone method
global.fetch = jest.fn();
