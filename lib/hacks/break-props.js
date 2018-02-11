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
        return `${prefix}column-${prop}`;
    }

    /**
     * Return property name by final spec
     */
    normalize(prop) {
        if (prop.indexOf('inside') !== -1) {
            return 'break-inside';
        } else if (prop.indexOf('before') !== -1) {
            return 'break-before';
        } else {
            return 'break-after';
        }
    }

    /**
     * Change prefixed value for avoid-column and avoid-page
     */
    set(decl, prefix) {
        if (decl.prop === 'break-inside' &&
            decl.value === 'avoid-column' ||
            decl.value === 'avoid-page'
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
        } else if (/region/i.test(decl.value) || /page/i.test(decl.value)) {
            return undefined;
        } else {
            return super.insert(decl, prefix, prefixes);
        }
    }

}

module.exports = BreakProps;
