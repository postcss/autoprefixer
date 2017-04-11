const Declaration = require('../declaration');

class GridEnd extends Declaration {

    static names = [
        'grid-row-end', 'grid-column-end',
        'grid-row-span', 'grid-column-span'
    ];

    /**
     * Do not add prefix for unsupported value in IE
     */
    check(decl) {
        return decl.value.indexOf('span') !== -1;
    }

    /**
     * Return a final spec property
     */
    normalize(prop) {
        return prop.replace(/(-span|-end)/, '');
    }

    /**
     * Change property name for IE
     */
    prefixed(prop, prefix) {
        if (prefix === '-ms-') {
            return prefix + prop.replace('-end', '-span');
        } else {
            return super.prefixed(prop, prefix);
        }
    }

    /**
     * Change repeating syntax for IE
     */
    set(decl, prefix) {
        if (prefix === '-ms-') {
            decl.value = decl.value.replace(/span\s/i, '');
        }
        return super.set(decl, prefix);
    }

}

module.exports = GridEnd;
