const Declaration = require('../declaration');

class GridStart extends Declaration {

    static names = [
        'grid-row-start', 'grid-column-start'
    ];

    /**
     * Do not add prefix for unsupported value in IE
     */
    check(decl) {
        return decl.value.indexOf('/') === -1 ||
            decl.value.indexOf('span') !== -1;
    }

    /**
     * Return a final spec property
     */
    normalize(prop) {
        return prop.replace('-start', '');
    }

    /**
     * Change property name for IE
     */
    prefixed(prop, prefix) {
        if (prefix === '-ms-') {
            return prefix + prop.replace('-start', '');
        } else {
            return super.prefixed(prop, prefix);
        }
    }
}

module.exports = GridStart;
