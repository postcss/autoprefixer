const Declaration = require('../declaration');

class ImageRendering extends Declaration {
    static initClass() {
        this.names = ['image-rendering', 'interpolation-mode'];
    }

  // Add hack only for crisp-edges
    check(decl) {
        return decl.value === 'pixelated';
    }

  // Change property name for IE
    prefixed(prop, prefix) {
        if (prefix === '-ms-') {
            return '-ms-interpolation-mode';
        } else {
            return super.prefixed(...arguments);
        }
    }

  // Change property and value for IE
    set(decl, prefix) {
        if (prefix === '-ms-') {
            decl.prop  = '-ms-interpolation-mode';
            decl.value = 'nearest-neighbor';
            return decl;
        } else {
            return super.set(...arguments);
        }
    }

  // Return property name by spec
    normalize(prop) {
        return 'image-rendering';
    }

  // Warn on old value
    process(node, result) {
        return super.process(...arguments);
    }
}
ImageRendering.initClass();

module.exports = ImageRendering;
