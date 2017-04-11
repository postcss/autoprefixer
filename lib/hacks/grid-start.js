const Declaration = require('../declaration');

class GridStart extends Declaration {

    static names = [
        'grid-row-start', 'grid-column-start', 'grid-row', 'grid-column'
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

    /**
     * Split one value to two
     */
    insert(decl, prefix, prefixes) {
        const parts = this.splitValue(decl, prefix);
        if (parts.length === 2) {
            decl.cloneBefore({
                prop: `-ms-${decl.prop}-span`,
                value: parts[1]
            });
        }
        return super.insert(decl, prefix, prefixes);
    }

    /**
     * Change value for combine property
     */
    set(decl, prefix) {
        const parts = this.splitValue(decl, prefix);
        if (parts.length === 2) {
            decl.value = parts[0];
        }
        return super.set(decl, prefix);
    }

    /**
     * If property contains start and end
     */
    splitValue(decl, prefix) {
        if (prefix === '-ms-' && decl.prop.indexOf('-start') === -1) {
            const parts = decl.value.split(/\s*\/\s*span\s+/);
            if (parts.length === 2) {
                return parts;
            }
        }
        return false;
    }

}

module.exports = GridStart;
