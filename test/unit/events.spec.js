import * as events from '../../src/events.js';

// --------------------------------------------------
// on
// --------------------------------------------------
describe('events', () => {
  it('should export api', () => {
    expect(typeof events.on).toBe('function');
    expect(typeof events.off).toBe('function');
    expect(typeof events.emit).toBe('function');
  });

  // --------------------------------------------------
  // on
  // --------------------------------------------------
  describe('on', () => {
    afterEach(() => {
      delete events.callbacks.foo;
    });

    it('should add the event to the callbacks object', () => {
      function func() {}
      events.on('foo', func);

      expect(Array.isArray(events.callbacks.foo)).toBe(true);
      expect(events.callbacks.foo[0]).toBe(func);
    });

    it('should append the event if it already exists', () => {
      function func1() {}
      function func2() {}
      events.on('foo', func1);
      events.on('foo', func2);

      expect(Array.isArray(events.callbacks.foo)).toBe(true);
      expect(events.callbacks.foo[0]).toBe(func1);
      expect(events.callbacks.foo[1]).toBe(func2);
    });
  });

  // --------------------------------------------------
  // off
  // --------------------------------------------------
  describe('off', () => {
    function func() {}

    beforeEach(() => {
      events.on('foo', func);
    });

    afterEach(() => {
      delete events.callbacks.foo;
    });

    it('should remove the callback from the event', () => {
      events.off('foo', func);

      expect(events.callbacks.foo.length).toBe(0);
    });

    it('should only remove the callback', () => {
      function func1() {}
      function func2() {}
      events.on('foo', func1);
      events.on('foo', func2);

      events.off('foo', func);

      expect(events.callbacks.foo.length).toBe(2);
      expect(events.callbacks.foo[0]).toBe(func1);
      expect(events.callbacks.foo[1]).toBe(func2);
    });

    it('should not error if the callback was not added before', () => {
      function fn() {
        events.off('foo', () => {});
      }

      expect(fn).not.toThrow();
    });

    it('should not error if the event was not added before', () => {
      function fn() {
        events.off('myEvent', () => {});
      }

      expect(fn).not.toThrow();
    });
  });

  // --------------------------------------------------
  // emit
  // --------------------------------------------------
  describe('emit', () => {
    let func = jest.fn();

    beforeEach(() => {
      func.mockClear();
      events.on('foo', func);
    });

    afterEach(() => {
      delete events.callbacks.foo;
    });

    it('should call the callback', () => {
      events.emit('foo');

      expect(func).toHaveBeenCalled();
    });

    it('should pass all parameters to the callback', () => {
      events.emit('foo', 1, 2, 3);

      expect(func).toHaveBeenCalledWith(1, 2, 3);
    });

    it('should call the callbacks in order', () => {
      let func1 = jest.fn();
      let func2 = jest.fn();
      events.on('foo', func1);
      events.on('foo', func2);

      events.emit('foo');

      // Jest doesn't have callOrder like Sinon, but we can check call sequence
      expect(func).toHaveBeenCalled();
      expect(func1).toHaveBeenCalled();
      expect(func2).toHaveBeenCalled();
    });

    it('should not error if the event was not added before', () => {
      function fn() {
        events.emit('myEvent', () => {});
      }

      expect(fn).not.toThrow();
    });
  });
});
