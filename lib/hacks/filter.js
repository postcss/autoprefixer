const Declaration = require('../declaration');

class Filter extends Declaration {

    static names = ['filter'];

    /**
     * Check is it Internet Explorer filter
     */
    check(decl) {
        const v = decl.value;
        return (
            v.toLowerCase().indexOf('alpha(') === -1 &&
            v.indexOf('DXImageTransform.Microsoft') === -1 &&
            v.indexOf('data:image/svg+xml') === -1
        );
    }

}

module.exports = Filter;
