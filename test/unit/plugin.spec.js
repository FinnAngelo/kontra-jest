import * as plugin from '../../src/plugin.js';

// --------------------------------------------------
// plugin
// --------------------------------------------------
describe('plugin', () => {
  let add = (p1, p2) => p1 + p2;
  let myPlugin = {
    beforeAdd() {
      return;
    },
    afterAdd(foobar, result) {
      return result * 2;
    }
  };
  let root, classObject;

  beforeEach(() => {
    // fake a Class prototype chain
    root = { add };
    classObject = Object.create(root);
    classObject.prototype = root;
  });

  it('should export api', () => {
    expect(plugin.registerPlugin).toEqual(expect.any(Function));
    expect(plugin.unregisterPlugin).toEqual(expect.any(Function));
    expect(plugin.extendObject).toEqual(expect.any(Function));
  });

  // --------------------------------------------------
  // registerPlugin
  // --------------------------------------------------
  describe('registerPlugin', () => {
    beforeEach(() => {
      plugin.registerPlugin(classObject, myPlugin);
    });

    it('should create an interceptor list', () => {
      expect(classObject.prototype._inc).toEqual(expect.any(Object));
    });

    it('should create before and after interceptor functions', () => {
      expect(classObject.prototype._bInc).toEqual(expect.any(Function));
      expect(classObject.prototype._aInc).toEqual(expect.any(Function));
    });

    it('should save the original method', () => {
      expect(classObject.prototype._oadd).toEqual(expect.any(Function));
    });

    it('should override the original method', () => {
      expect(classObject.add).not.toBe(add);
    });

    it('should create interceptors for the method', () => {
      expect(classObject.prototype._inc.add).toEqual(expect.any(Object));
      expect(classObject.prototype._inc.add.before).toEqual(expect.any(Array));
      expect(classObject.prototype._inc.add.after).toEqual(expect.any(Array));
    });

    it('should add before method to interceptor list', () => {
      expect(classObject.prototype._inc.add.before.length).toBe(1);
      expect(classObject.prototype._inc.add.before[0]).toBe(myPlugin.beforeAdd);
    });

    it('should add the after method to interceptor list', () => {
      expect(classObject.prototype._inc.add.after.length).toBe(1);
      expect(classObject.prototype._inc.add.after[0]).toBe(myPlugin.afterAdd);
    });

    it('should not override interceptors if object is already intercepted', () => {
      plugin.registerPlugin(classObject, {});

      expect(classObject.prototype._inc.add).toBeTruthy();
      expect(classObject.prototype._inc.add.before.length).toBe(1);
      expect(classObject.prototype._inc.add.after.length).toBe(1);
    });

    it("should ignore functions that don't match the before/after syntax", () => {
      plugin.registerPlugin(classObject, {
        doAdd() {}
      });

      expect(classObject.prototype._inc.add.before.length).toBe(1);
      expect(classObject.prototype._inc.add.after.length).toBe(1);
    });

    it('should do nothing if original method does not exist', () => {
      plugin.registerPlugin(classObject, {
        afterBaz() {},
        beforeBaz() {}
      });

      expect(classObject.prototype.baz).toBeUndefined();
      expect(classObject.prototype._inc.baz).toBeUndefined();
    });

    it('should allow multiple plugins to be registered for the same method', () => {
      plugin.registerPlugin(classObject, myPlugin);

      expect(classObject.prototype._inc.add.before.length).toBe(2);
      expect(classObject.prototype._inc.add.after.length).toBe(2);
    });

    describe('intercepted method', () => {
      it('should call the original method', () => {
        const spy = jest.spyOn(classObject.prototype, '_oadd');
        classObject.add(1, 2);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(1, 2);
        spy.mockRestore();
      });

      it('should call any before methods', () => {
        const stub = jest.fn();
        classObject.prototype._inc.add.before[0] = stub;
        classObject.add(1, 2);

        expect(stub).toHaveBeenCalled();
        expect(stub).toHaveBeenCalledWith(classObject, 1, 2);
      });

      it('should pass the modified arguments from one before plugin to the next', () => {
        const spy = jest.spyOn(classObject.prototype, '_oadd');
        const stub = jest.fn().mockReturnValue([5, 6]);
        classObject.prototype._inc.add.before[0] = stub;

        classObject.add(1, 2);
        expect(stub).toHaveBeenCalledWith(classObject, 1, 2);
        expect(spy).toHaveBeenCalledWith(5, 6);
        spy.mockRestore();
      });

      it('should pass the previous result if before plugin returns null', () => {
        const spy = jest.spyOn(classObject.prototype, '_oadd');
        const stub1 = jest.fn().mockReturnValue(null);
        const stub2 = jest.fn().mockReturnValue([5, 6]);
        plugin.registerPlugin(classObject, {
          beforeAdd: stub1
        });
        plugin.registerPlugin(classObject, {
          beforeAdd: stub2
        });

        classObject.add(1, 2);

        expect(stub2).toHaveBeenCalledWith(classObject, 1, 2);
        expect(spy).toHaveBeenCalledWith(5, 6);
        spy.mockRestore();
      });

      it('should call any after methods', () => {
        const stub = jest.fn();
        classObject.prototype._inc.add.after[0] = stub;
        classObject.add(1, 2);

        expect(stub).toHaveBeenCalled();
        expect(stub).toHaveBeenCalledWith(classObject, 3, 1, 2);
      });

      it('should return the result of all the after methods', () => {
        let result = classObject.add(1, 2);

        expect(result).toBe(6);
      });

      it('should pass the result from one after plugin to the next', () => {
        const stub = jest.fn().mockImplementation((context, result, p1, p2) => {
          return result + p1 * p2;
        });
        plugin.registerPlugin(classObject, {
          afterAdd: stub
        });

        let result = classObject.add(1, 2);
        expect(stub).toHaveBeenCalledWith(classObject, 6, 1, 2);
        expect(result).toBe(8);
      });

      it('should pass the previous result if after plugin returns null', () => {
        const stub1 = jest.fn().mockReturnValue(null);
        const stub2 = jest.fn().mockImplementation((context, result, p1, p2) => {
          return result + p1 * p2;
        });
        plugin.registerPlugin(classObject, {
          afterAdd: stub1
        });
        plugin.registerPlugin(classObject, {
          afterAdd: stub2
        });

        let result = classObject.add(1, 2);

        expect(stub2).toHaveBeenCalledWith(classObject, 6, 1, 2);
        expect(result).toBe(8);
      });

      it('should call plugins in the ordered they were registered', () => {
        const stub = jest.fn();
        const stub1 = jest.fn().mockReturnValue(null);
        const stub2 = jest.fn().mockImplementation((context, result, p1, p2) => {
          return result + p1 * p2;
        });
        plugin.registerPlugin(classObject, {
          afterAdd: stub1
        });
        plugin.registerPlugin(classObject, {
          afterAdd: stub2
        });
        classObject.prototype._inc.add.before[0] = stub;

        classObject.add(1, 2);

        // Check that all functions were called
        expect(stub).toHaveBeenCalled();
        expect(stub1).toHaveBeenCalled();
        expect(stub2).toHaveBeenCalled();
      });

      it("should do nothing if kontra object doesn't exist", () => {
        let fn = () => {
          plugin.registerPlugin('baz', myPlugin);
        };

        expect(fn).not.toThrow();
      });
    });
  });

  // --------------------------------------------------
  // unregisterPlugin
  // --------------------------------------------------
  describe('unregisterPlugin', () => {
    beforeEach(() => {
      plugin.registerPlugin(classObject, myPlugin);
      plugin.unregisterPlugin(classObject, myPlugin);
    });

    it('should remove the before method from the interceptor list', () => {
      expect(classObject.prototype._inc.add.before.length).toBe(0);
    });

    it('should remove the after method from the interceptor list', () => {
      expect(classObject.prototype._inc.add.after.length).toBe(0);
    });

    it("should do nothing if kontra object doesn't exist", () => {
      let fn = () => {
        plugin.unregisterPlugin('baz', myPlugin);
      };

      expect(fn).not.toThrow();
    });

    it('should do nothing if object has not been overridden', () => {
      classObject.prototype = {};

      let fn = () => {
        plugin.unregisterPlugin(classObject, myPlugin);
      };

      expect(fn).not.toThrow();
    });

    it("should ignore functions that don't match the before/after syntax", () => {
      let fn = () => {
        plugin.unregisterPlugin(classObject, {
          doAdd() {}
        });
      };

      expect(fn).not.toThrow();
    });

    it('should not remove methods from other plugins', () => {
      let fn = () => {
        plugin.unregisterPlugin(classObject, {
          afterAdd() {},
          beforeAdd() {}
        });
      };

      plugin.registerPlugin(classObject, myPlugin);
      expect(fn).not.toThrow();
      expect(classObject.prototype._inc.add.before.length).toBe(1);
      expect(classObject.prototype._inc.add.after.length).toBe(1);
    });
  });

  // --------------------------------------------------
  // extendObject
  // --------------------------------------------------
  describe('extendObject', () => {
    it('should add properties onto the object', () => {
      let properties = {
        number: 1,
        string: 'hello',
        fn() {},
        object: {}
      };

      plugin.extendObject(classObject, properties);

      expect(classObject.number).toBe(properties.number);
      expect(classObject.string).toBe(properties.string);
      expect(classObject.fn).toBe(properties.fn);
      expect(classObject.object).toBe(properties.object);
    });

    it('should not add properties onto the object that already exist', () => {
      let properties = {
        number: 1,
        string: 'hello',
        fn() {},
        object: {}
      };

      let override = {
        number: 20
      };

      plugin.extendObject(classObject, properties);
      plugin.extendObject(classObject, override);

      expect(classObject.number).toBe(properties.number);
    });

    it("should do nothing if kontra object doesn't exist", () => {
      let fn = () => {
        plugin.extendObject({}, myPlugin);
      };

      expect(fn).not.toThrow();
    });
  });
});
