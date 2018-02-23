const Declaration = require('../declaration');
const utils = require('./grid-utils');

class GridRowsColumns extends Declaration {

    static names = [
        'grid-template-rows', 'grid-template-columns',
        'grid-rows', 'grid-columns'
    ];

    /**
     * Change property name for IE
     */
    prefixed(prop, prefix) {
        if (prefix === '-ms-') {
            return prefix + prop.replace('template-', '');
        } else {
            return super.prefixed(prop, prefix);
        }
    }

    /**
     * Change IE property back
     */
    normalize(prop) {
        return prop.replace(/^grid-(rows|columns)/, 'grid-template-$1');
    }

    /**
     * Change repeating syntax for IE
     */
    set(decl, prefix) {
        if (prefix === '-ms-' && decl.value.indexOf('repeat(') !== -1) {
            decl.value = utils.changeRepeat(decl.value);
        }
        return super.set(decl, prefix);
    }

}

module.exports = GridRowsColumns;
