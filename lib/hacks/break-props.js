const Declaration = require('../declaration');

class BreakProps extends Declaration {

    static names = [
        'break-inside', 'page-break-inside', 'column-break-inside',
        'break-before', 'page-break-before', 'column-break-before',
        'break-after', 'page-break-after', 'column-break-after'
    ];

    /**
     * Change name for -webkit- and -moz- prefix
     */
    prefixed(prop, prefix) {
        if (prefix === '-webkit-') {
            return `-webkit-column-${prop}`;
        } else if (prefix === '-moz-') {
            return `page-${prop}`;
        } else {
            return super.prefixed(prop, prefix);
        }
    }

    /**
     * Return property name by final spec
     */
    normalize(prop) {
        if (prop.indexOf('inside') !== -1) {
            return 'break-inside';
        } else if (prop.indexOf('before') !== -1) {
            return 'break-before';
        } else if (prop.indexOf('after') !== -1) {
            return 'break-after';
        }
        return undefined;
    }

    /**
     * Change prefixed value for avoid-column and avoid-page
     */
    set(decl, prefix) {
        const v = decl.value;
        if (decl.prop === 'break-inside' &&
            v === 'avoid-column' ||
            v === 'avoid-page'
        ) {
            decl.value = 'avoid';
        }
        return super.set(decl, prefix);
    }

    /**
     * Don’t prefix some values
     */
    insert(decl, prefix, prefixes) {
        if (decl.prop !== 'break-inside') {
            return super.insert(decl, prefix, prefixes);
        } else if (decl.value === 'avoid-region') {
            return undefined;
        } else if (decl.value === 'avoid-page' && prefix === '-webkit-') {
            return undefined;
        } else {
            return super.insert(decl, prefix, prefixes);
        }
    }

}

module.exports = BreakProps;
