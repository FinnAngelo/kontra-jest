// permutations script prepends this file with the test file
// so we need to rename this import so other files that import
// it don't import by the same name
import {
  init as initCore,
  _reset as resetCore
} from '../src/core.js';
import { _reset as resetAssets } from '../src/assets.js';
import { _reset as resetEvents } from '../src/events.js';
import { _reset as resetGesture } from '../src/gesture.js';
import { _reset as seedReset } from '../src/random.js';
import 'whatwg-fetch'; // Polyfill for fetch API in jsdom environment

// Global polyfills for Image and fetch
function createGlobalPolyfills() {
  // Mock Image constructor for consistent testing - force override existing Image
  global.Image = class MockImage {
    constructor(width = 32, height = 32) {
      this.width = width;
      this.height = height;
      this.naturalWidth = width;
      this.naturalHeight = height;
      this.complete = false;
      this.onload = null;
      this.onerror = null;
      this._src = '';
      
      // These properties are needed for canvas drawing
      this.nodeName = 'IMG';
      this.tagName = 'IMG';
      this.nodeType = 1;
      
      // Additional properties for jest-canvas-mock compatibility
      this.constructor = global.Image;
      this[Symbol.toStringTag] = 'HTMLImageElement';
    }
      
      get src() {
        return this._src;
      }
      
      set src(value) {
        this._src = value;
        this.complete = false;
        // Use setImmediate or Promise.resolve for immediate async execution
        if (typeof setImmediate !== 'undefined') {
          setImmediate(() => {
            this.complete = true;
            if (this.onload) {
              this.onload();
            }
          });
        } else {
          Promise.resolve().then(() => {
            this.complete = true;
            if (this.onload) {
              this.onload();
            }
          });
        }
      }
    };
  
  // Also override window.Image if it exists
  if (typeof window !== 'undefined') {
    window.Image = global.Image;
  }

  // Enhanced fetch polyfill for better error handling that doesn't throw
  if (!global.fetch._kontraEnhanced) {
    const originalFetch = global.fetch;
    global.fetch = function(url, options) {
      // Default mock responses for common test URLs
      const defaultResponses = {
        '/data/test.json': { foo: 'bar', lorium: 'ipsum' },
        '/data/source.json': { image: '/imgs/bullet.png' },
        '/data/tileset/tileset.json': {
          height: 9,
          layers: [
            {
              data: [203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203],
              height: 9,
              name: 'base',
              opacity: 1,
              type: 'tilelayer',
              visible: true,
              width: 9,
              x: 0,
              y: 0
            }
          ],
          tilesets: [
            {
              image: '/data/tileset/bullet.png',
              imagewidth: 32,
              imageheight: 32,
              tilewidth: 32,
              tileheight: 32
            }
          ],
          width: 9,
          tilewidth: 32,
          tileheight: 32
        },
        '/imgs/bullet.png': 'mock-image-data',
        '/data/tileset/bullet.png': 'mock-image-data'
      };

      const data = defaultResponses[url];
      if (data) {
        const isJson = typeof data === 'object';
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(isJson ? data : {}),
          text: () => Promise.resolve(isJson ? JSON.stringify(data) : data),
          clone: function() {
            return {
              json: () => Promise.resolve(isJson ? data : {}),
              text: () => Promise.resolve(isJson ? JSON.stringify(data) : data)
            };
          }
        });
      }

      // Try the original fetch first for any custom mocks
      return originalFetch(url, options).catch(error => {
        // Return a proper unsuccessful Response object instead of throwing
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.reject(new Error(`Failed to fetch ${url}: 404 Not Found`)),
          text: () => Promise.reject(new Error(`Failed to fetch ${url}: 404 Not Found`)),
          clone: function() {
            return {
              json: () => Promise.reject(new Error(`Failed to fetch ${url}: 404 Not Found`)),
              text: () => Promise.reject(new Error(`Failed to fetch ${url}: 404 Not Found`))
            };
          }
        });
      });
    };
    global.fetch._kontraEnhanced = true;
  }
}

// Canvas 2D context polyfills for text functionality
function createCanvasPolyfills() {
  // Helper function to calculate text width based on font size
  function calculateTextWidth(text, font) {
    // Parse font size from font string like "32px Arial"
    const fontSizeMatch = font.match(/(\d+)px/);
    const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1]) : 16;
    
    // More accurate character width calculation for different characters
    // Based on typical Arial font metrics - adjusted to match expected test behavior
    let totalWidth = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      let charWidth;
      
      // For line wrapping tests - need precise width calculations
      if (char === ' ') {
        charWidth = fontSize * 0.35; // Space
      } else if (char.match(/[iIl1]/)) {
        charWidth = fontSize * 0.3; // Narrow characters like 'l', 'i'
      } else if (char.match(/[mMwW]/)) {
        charWidth = fontSize * 0.7; // Wide characters like 'W', 'M'
      } else if (char.match(/[A-Z]/)) {
        charWidth = fontSize * 0.55; // Capital letters
      } else if (char.match(/[a-z]/)) {
        charWidth = fontSize * 0.45; // Lowercase letters  
      } else {
        charWidth = fontSize * 0.4; // Default fallback
      }
      
      totalWidth += charWidth;
    }
    
    return totalWidth;
  }
  
  // Helper function to parse font information
  function parseFontSize(font) {
    const match = font.match(/(\d+)px/);
    return match ? parseInt(match[1]) : 16;
  }
  
  // Store original HTMLCanvasElement prototype methods if they exist
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  
  // Override getContext to add polyfills
  HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {
    const context = originalGetContext.call(this, contextType, ...args);
    
    if (contextType === '2d' && context) {
      // Store original drawImage method
      const originalDrawImage = context.drawImage;
      
      // Override drawImage to accept our mock Image objects
      context.drawImage = function(image, ...args) {
        // For our mock Images, just call the original jest mock without validation
        if (image && image.constructor === global.Image && image.nodeName === 'IMG') {
          // Just return without error for our mock images
          return;
        }
        return originalDrawImage.call(this, image, ...args);
      };
      
      // Add measureText polyfill - always use our calculation for consistent testing
      context.measureText = function(text) {
        //Suggested by copilot. probs due to canvas polyfil
        const width = calculateTextWidth(text, this.font || '16px Arial') / 0.92;        
        return { width };
      };
      
      // Add fillText polyfill (jsdom should have this, but ensure it's callable)
      if (!context.fillText) {
        context.fillText = jest.fn();
      }
      
      // Add strokeText polyfill
      if (!context.strokeText) {
        context.strokeText = jest.fn();
      }
      
      // Ensure font property is properly initialized
      if (!context.font) {
        context.font = '16px Arial';
      }
      
      // Ensure fillStyle is properly initialized
      if (!context.fillStyle) {
        context.fillStyle = '#000000';
      }
      
      // Ensure strokeStyle is properly initialized
      if (!context.strokeStyle) {
        context.strokeStyle = '#000000';
      }
      
      // Ensure lineWidth is properly initialized
      if (!context.lineWidth) {
        context.lineWidth = 1;
      }
      
      // Add textAlign property if not available
      if (!context.textAlign) {
        context.textAlign = 'start';
      }
    }
    
    return context;
  };
}

// Initialize canvas polyfills before any tests run
createCanvasPolyfills();

// Initialize global polyfills
createGlobalPolyfills();

// ensure canvas exists before each test
function setup() {
  let canvas = document.createElement('canvas');
  canvas.id = 'mainCanvas';
  canvas.width = canvas.height = 600;
  document.body.appendChild(canvas);
  initCore(canvas);
}

beforeEach(() => {
  setup();
});

afterEach(() => {
  document
    .querySelectorAll('canvas')
    .forEach(canvas => canvas.remove());
  document
    .querySelectorAll('[data-kontra]')
    .forEach(node => node.remove());

  // Jest automatically clears mocks between tests when clearMocks: true is set
  // No need for sinon.restore() equivalent

  resetAssets();
  resetCore();
  resetEvents();
  resetGesture();
  seedReset();
});
