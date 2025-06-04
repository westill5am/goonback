// ReadableStream polyfill for Node.js 16 compatibility
// This fixes WebAssembly memory issues with undici package

if (typeof globalThis.ReadableStream === 'undefined') {
  const { Readable } = require('stream');
  
  globalThis.ReadableStream = class ReadableStream {
    constructor(underlyingSource = {}) {
      this._readable = new Readable({
        read() {
          if (underlyingSource.start) {
            underlyingSource.start(this);
          }
        }
      });
      
      this._reader = null;
    }
    
    getReader() {
      if (this._reader) {
        throw new TypeError('ReadableStream is locked');
      }
      
      this._reader = {
        read: () => {
          return new Promise((resolve) => {
            const chunk = this._readable.read();
            if (chunk === null) {
              resolve({ done: true, value: undefined });
            } else {
              resolve({ done: false, value: chunk });
            }
          });
        },
        
        releaseLock: () => {
          this._reader = null;
        }
      };
      
      return this._reader;
    }
    
    cancel() {
      if (this._readable) {
        this._readable.destroy();
      }
    }
  };
  
  console.log('✓ ReadableStream polyfill installed for Node.js 16 compatibility');
}
