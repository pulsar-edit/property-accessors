const Mixin = require('mixto');
const { WeakMap } = global;

module.exports =
class PropertyAccessors extends Mixin {
  accessor(name, definition) {
    if (typeof definition === 'function') {
      definition = {get: definition};
    }
    return Object.defineProperty(this, name, definition);
  }

  advisedAccessor(name, definition) {
    let getAdvice, setAdvice;
    if (typeof definition === 'function') {
      getAdvice = definition;
    } else {
      getAdvice = definition.get;
      setAdvice = definition.set;
    }

    const values = new WeakMap;
    return this.accessor(name, {
      get() {
        if (getAdvice != null) {
          getAdvice.call(this);
        }
        return values.get(this);
      },
      set(newValue) {
        if (setAdvice != null) {
          setAdvice.call(this, newValue, values.get(this));
        }
        return values.set(this, newValue);
      }
    }
    );
  }

  lazyAccessor(name, definition) {
    const values = new WeakMap;
    return this.accessor(name, {
      get() {
        if (values.has(this)) {
          return values.get(this);
        } else {
          values.set(this, definition.call(this));
          return values.get(this);
        }
      },
      set(value) {
        return values.set(this, value);
      }
    }
    );
  }
}
