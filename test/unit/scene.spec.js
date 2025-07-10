import Scene, { SceneClass } from '../../src/scene.js';
import {
  _reset,
  init,
  getContext,
  getCanvas
} from '../../src/core.js';
import { emit } from '../../src/events.js';
import { noop, srOnlyStyle } from '../../src/utils.js';
import { collides } from '../../src/helpers.js';

// --------------------------------------------------
// scene
// --------------------------------------------------
describe('scene', () => {
  let scene;
  beforeEach(() => {
    scene = Scene({
      id: 'myId'
    });
  });

  afterEach(() => {
    scene.destroy();
  });

  it('should export class', () => {
    expect(typeof SceneClass).toBe('function');
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should setup basic properties', () => {
      expect(scene.id).toBe('myId');
      expect(scene.name).toBe('myId');
      expect(scene.objects).toEqual([]);
      expect(scene.context).toBe(getContext());
      expect(scene.cullObjects).toBe(true);
      expect(scene.cullFunction).toBe(collides);
    });

    it('should override basic properties', () => {
      let context = {
        canvas: getCanvas()
      };

      scene.destroy();
      scene = Scene({
        context,
        cullObjects: false,
        cullFunction: noop,
        onShow: noop,
        onHide: noop
      });

      expect(scene.context).toBe(context);
      expect(scene.cullObjects).toBe(false);
      expect(scene.cullFunction).toBe(noop);
      expect(scene.onShow).toBe(noop);
      expect(scene.onHide).toBe(noop);
    });

    it('should set all additional properties on the scene', () => {
      scene.destroy();
      scene = Scene({
        foo: 'bar',
        alive: true
      });

      expect(scene.foo).toBe('bar');
      expect(scene.alive).toBe(true);
    });

    it('should create a DOM node and add it to the page', () => {
      expect(scene.node).toBeDefined();
      expect(scene.node.id).toBe(scene.id);
      expect(scene.node.tabIndex).toBe(-1);
      expect(scene.node.getAttribute('aria-label')).toBe(
        scene.name
      );
      expect(document.body.contains(scene.node)).toBe(true);
    });

    it('should not allow setting the node', () => {
      expect(() => (scene.node = 1)).toThrow();
      expect(scene.node instanceof HTMLElement).toBe(true);
    });

    it('should add objects', () => {
      let object = {};
      scene.destroy();
      scene = Scene({
        objects: [object]
      });

      expect(scene.objects.length).toBe(1);
      expect(scene.objects[0]).toBe(object);
    });

    it('should add the scene as an immediate sibling to the canvas', () => {
      expect(scene.context.canvas.nextSibling).toBe(scene._dn);
    });

    it('should hide the DOM node', () => {
      let styles = srOnlyStyle
        .split(';')
        .map(style => style.split(':')[0].trim())
        .filter(style => !!style);

      scene._dn
        .getAttribute('style')
        .split(';')
        .map(style => style.split(':')[0].trim())
        .filter(style => !!style)
        .forEach((prop, index) => {
          expect(styles[index]).toBe(prop);
        });
    });

    it('should allow objects', () => {
      let object = {};
      scene.destroy();
      scene = Scene({
        id: 'myId',
        objects: [object]
      });

      expect(scene.objects.length).toBe(1);
      expect(scene.objects[0]).toBe(object);
    });

    it('should create the camera and center it', () => {
      let canvas = scene.context.canvas;
      expect(scene.camera).toBeDefined();
      expect(scene.camera.x).toBe(canvas.width / 2);
      expect(scene.camera.y).toBe(canvas.height / 2);
      expect(scene.camera.width).toBe(canvas.width);
      expect(scene.camera.height).toBe(canvas.height);
      expect(scene.camera.anchor).toEqual({ x: 0.5, y: 0.5 });
    });

    it('should create a dom node', () => {
      _reset();

      scene.destroy();
      scene = Scene({
        id: 'myId'
      });

      expect(scene._dn).toBeDefined();
    });

    it('should not add dom node to body and not set camera if context is not set', () => {
      _reset();

      scene.destroy();
      scene = Scene({
        id: 'myId'
      });

      expect(scene._dn.isConnected).toBe(false);
      expect(scene.camera.centerX).toBeUndefined();
    });

    it('should set context if kontra.init is called after created', () => {
      _reset();

      scene.destroy();
      scene = Scene({
        id: 'myId'
      });

      expect(scene.context).toBeUndefined();

      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);

      expect(scene.context).toBe(canvas.getContext('2d'));
    });

    it('should not override context when set if kontra.init is called after created', () => {
      let context = getContext();

      _reset();

      scene.destroy();
      scene = Scene({
        id: 'myId',
        context
      });

      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);

      expect(scene.context).toBe(context);
    });

    it('should add dom node to body and set camera if kontra.init is called after created', () => {
      _reset();

      scene.destroy();
      scene = Scene({
        id: 'myId'
      });

      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);

      expect(scene._dn.isConnected).toBe(true);
      expect(scene.camera.centerX).toBeDefined();
    });
  });

  // --------------------------------------------------
  // show
  // --------------------------------------------------
  describe('show', () => {
    it('should unset the hidden property', () => {
      scene.hidden = true;
      scene.show();

      expect(scene.hidden).toBe(false);
      expect(scene._dn.hidden).toBe(false);
    });

    it('should focus the DOM node', () => {
      const focusSpy = jest.spyOn(scene._dn, 'focus');
      scene.show();

      expect(document.activeElement).toBe(scene._dn);
      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    });

    it('should focus the first focusable object', () => {
      let object = {
        focus: jest.fn()
      };
      scene.add(object);
      scene.show();

      expect(object.focus).toHaveBeenCalledWith({ preventScroll: true });
    });

    it('should call onShow', () => {
      scene.onShow = jest.fn();
      scene.show();

      expect(scene.onShow).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // hide
  // --------------------------------------------------
  describe('hide', () => {
    it('should set the hidden property', () => {
      scene.hidden = false;
      scene.hide();

      expect(scene.hidden).toBe(true);
      expect(scene._dn.hidden).toBe(true);
    });

    it('should call onHide', () => {
      scene.onHide = jest.fn();
      scene.hide();

      expect(scene.onHide).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // add
  // --------------------------------------------------
  describe('add', () => {
    it('should add the object', () => {
      let object = {};
      scene.add(object);

      expect(scene.objects.length).toBe(1);
    });

    it('should add multiple objects', () => {
      let object1 = {};
      let object2 = {};
      scene.add(object1, object2);

      expect(scene.objects.length).toBe(2);
    });

    it('should add array of objects', () => {
      let object1 = {};
      let object2 = {};
      scene.add([object1, object2]);

      expect(scene.objects.length).toBe(2);
    });

    it('should set the objects parent to the scene', () => {
      let object = {};
      scene.add(object);
      expect(object.parent).toBe(scene);
    });

    it('should add any objects with DOM nodes to the scenes DOM node', () => {
      let object = {
        _dn: document.createElement('div')
      };
      scene.add(object);

      expect(scene._dn.contains(object._dn)).toBe(true);
    });

    it('should add DOM nodes of all descendants', () => {
      let node1 = document.createElement('div');
      let node2 = document.createElement('div');
      let object = {
        children: [
          {
            children: [
              {
                _dn: node1
              }
            ]
          },
          {
            _dn: node2
          }
        ]
      };
      scene.add(object);

      expect(scene._dn.contains(node1)).toBe(true);
      expect(scene._dn.contains(node2)).toBe(true);
    });

    it('should not take DOM nodes from descendants who have a DOM parent', () => {
      let node1 = document.createElement('div');
      let node2 = document.createElement('div');
      let object = {
        children: [
          {
            _dn: node1,
            children: [
              {
                _dn: node2
              }
            ]
          }
        ]
      };
      scene.add(object);

      expect(scene._dn.contains(node1)).toBe(true);
      expect(scene._dn.contains(node2)).toBe(false);
    });
  });

  // --------------------------------------------------
  // remove
  // --------------------------------------------------
  describe('remove', () => {
    it('should remove the object', () => {
      let object = {};
      scene.add(object);
      scene.remove(object);

      expect(scene.objects.length).toBe(0);
    });

    it('should remove multiple objects', () => {
      let object1 = {};
      let object2 = {};
      scene.add(object1, object2);
      scene.remove(object1, object2);

      expect(scene.objects.length).toBe(0);
    });

    it('should remove array of objects', () => {
      let object1 = {};
      let object2 = {};
      scene.add(object1, object2);
      scene.remove([object1, object2]);

      expect(scene.objects.length).toBe(0);
    });

    it('should remove the objects parent', () => {
      let object = {};
      scene.add(object);
      scene.remove(object);
      expect(object.parent).toBe(null);
    });

    it('should remove any objects with DOM nodes', () => {
      let object = {
        _dn: document.createElement('div')
      };
      scene.add(object);
      scene.remove(object);

      expect(scene._dn.contains(object._dn)).toBe(false);
      expect(document.body.contains(object._dn)).toBe(true);
    });

    it('should remove DOM nodes of all descendants', () => {
      let node1 = document.createElement('div');
      let node2 = document.createElement('div');
      let object = {
        objects: [
          {
            objects: [
              {
                _dn: node1
              }
            ]
          },
          {
            _dn: node2
          }
        ]
      };
      scene.add(object);
      scene.remove(object);

      expect(scene._dn.contains(node1)).toBe(false);
      expect(scene._dn.contains(node2)).toBe(false);
    });

    it('should not take DOM nodes from descendants who have a DOM parent', () => {
      let node1 = document.createElement('div');
      let node2 = document.createElement('div');
      node1.appendChild(node2);

      let object = {
        children: [
          {
            _dn: node1,
            children: [
              {
                _dn: node2
              }
            ]
          }
        ]
      };
      scene.add(object);
      scene.remove(object);

      expect(scene._dn.contains(node1)).toBe(false);
      expect(scene._dn.contains(node2)).toBe(false);
      expect(node1.contains(node2)).toBe(true);
    });

    it('moving the camera should set the scenes sx and sy properties', () => {
      let canvas = scene.context.canvas;
      scene.camera.x = 10;
      scene.camera.y = 20;

      expect(scene.sx).toBe(10 - canvas.width / 2);
      expect(scene.sy).toBe(20 - canvas.height / 2);
    });
  });

  // --------------------------------------------------
  // objects
  // --------------------------------------------------
  describe('objects', () => {
    it('should properly handle setting objects', () => {
      scene.add({ foo: 'bar' });
      scene.add({ faz: 'baz' });
      scene.add({ hello: 'world' });

      const removeSpy = jest.spyOn(scene, 'remove');
      const addSpy = jest.spyOn(scene, 'add');
      let object = {
        thing1: 'thing2'
      };

      let oldObjects = scene.objects;
      scene.objects = [object];

      expect(removeSpy).toHaveBeenCalledWith(oldObjects);
      expect(addSpy).toHaveBeenCalledWith([object]);
      expect(scene.objects.length).toBe(1);
      expect(scene.objects[0]).toBe(object);
    });
  });

  // --------------------------------------------------
  // destroy
  // --------------------------------------------------
  describe('destroy', () => {
    it('should remove the DOM node', () => {
      scene.destroy();

      expect(document.body.contains(scene._dn)).toBe(false);
    });

    it('should call destroy on all objects', () => {
      let object = {
        destroy: jest.fn()
      };
      scene.add(object);
      scene.destroy();

      expect(object.destroy).toHaveBeenCalled();
    });

    it('should not re-add DOM node on init', () => {
      let section = scene._dn;
      scene.destroy();
      emit('init');

      expect(section.isConnected).toBe(false);
    });
  });

  // --------------------------------------------------
  // update
  // --------------------------------------------------
  describe('update', () => {
    it('should call update on all objects if scene is not hidden', () => {
      let object = {
        update: jest.fn()
      };
      scene.add(object);
      scene.update();

      expect(object.update).toHaveBeenCalled();
    });

    it('should not call update on all objects if scene is hidden', () => {
      let object = {
        update: jest.fn()
      };
      scene.add(object);
      scene.hide();
      scene.update();

      expect(object.update).not.toHaveBeenCalled();
    });

    it('should not error on objects without update function', () => {
      let object = {};
      scene.add(object);

      function fn() {
        scene.update();
      }

      expect(fn).not.toThrow();
    });
  });

  // --------------------------------------------------
  // lookAt
  // --------------------------------------------------
  describe('lookAt', () => {
    it('should set the camera position to the object', () => {
      scene.lookAt({ x: 10, y: 10 });

      expect(scene.camera.x).toBe(10);
      expect(scene.camera.y).toBe(10);
    });

    it('should take into account world', () => {
      scene.lookAt({ x: 5, y: 5, world: { x: 10, y: 10 } });

      expect(scene.camera.x).toBe(10);
      expect(scene.camera.y).toBe(10);
    });

    it('should set the scenes sx and sy properties', () => {
      let canvas = scene.context.canvas;
      scene.lookAt({ x: 10, y: 20 });

      expect(scene.sx).toBe(10 - canvas.width / 2);
      expect(scene.sy).toBe(20 - canvas.height / 2);
    });
  });

  // --------------------------------------------------
  // render
  // --------------------------------------------------
  describe('render', () => {
    it('should call render on all objects', () => {
      let object = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        render: jest.fn()
      };
      scene.add(object);
      scene.render();

      expect(object.render).toHaveBeenCalled();
    });

    it('should not call render on all objects if scene is hidden', () => {
      let object = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        render: jest.fn()
      };
      scene.add(object);
      scene.hide();
      scene.render();

      expect(object.render).not.toHaveBeenCalled();
    });

    it('should cull objects outside camera bounds', () => {
      let object = {
        x: -20,
        y: 0,
        width: 10,
        height: 10,
        render: jest.fn()
      };
      scene.add(object);
      scene.render();

      expect(object.render).not.toHaveBeenCalled();
    });

    it('should not cull objects if cullObjects is false', () => {
      let object = {
        x: -20,
        y: 0,
        width: 10,
        height: 10,
        render: jest.fn()
      };
      scene.cullObjects = false;
      scene.add(object);
      scene.render();

      expect(object.render).toHaveBeenCalled();
    });

    it('should not error on objects without render function', () => {
      let object = {};
      scene.add(object);

      function fn() {
        scene.render();
      }

      expect(fn).not.toThrow();
    });

    it('should translate the canvas to the camera', () => {
      const spy = jest.spyOn(scene.context, 'translate');

      scene.lookAt({ x: 10, y: 10 });
      scene.render();

      expect(spy).toHaveBeenCalledWith(290, 290);
      const calls = spy.mock.calls;
      expect(calls[calls.length - 2]).toEqual([290, 290]);
    });

    it('should sort objects', () => {
      scene.cullObjects = false;
      scene.objects = [{ y: 20 }, { y: 10 }];
      scene.sortFunction = (a, b) => a.y - b.y;
      scene.render();

      expect(scene.objects[0].y).toBe(10);
      expect(scene.objects[1].y).toBe(20);
    });

    it('should sort objects after being culled', () => {
      const cullSpy = jest.fn().mockReturnValue(true);
      const sortSpy = jest.fn();

      let object1 = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        render: jest.fn()
      };
      let object2 = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        render: jest.fn()
      };

      scene.objects = [object1, object2];
      scene.cullFunction = cullSpy;
      scene.sortFunction = sortSpy;
      scene.render();

      expect(sortSpy).toHaveBeenCalled();
      expect(cullSpy).toHaveBeenCalled();
    });
  });
});
