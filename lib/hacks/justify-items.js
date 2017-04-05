const Declaration = require('../declaration');

class JustifyItems extends Declaration {
    static initClass() {
        this.names = ['justify-items', 'grid-column-align'];
    }

  // Change property name for IE
    prefixed(prop, prefix) {
        return prefix + (prefix === '-ms-' ?
      'grid-column-align'    :
      prop);
    }

  // Change IE property back
    normalize(prop) {
        return 'justify-items';
    }
}
JustifyItems.initClass();

module.exports = JustifyItems;
