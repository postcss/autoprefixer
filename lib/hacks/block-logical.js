const Declaration = require('../declaration');

class BlockLogical extends Declaration {

    static names = [
        'border-block-start', 'border-block-end',
        'margin-block-start', 'margin-block-end',
        'padding-block-start', 'padding-block-end',
        'border-before', 'border-after',
        'margin-before', 'margin-after',
        'padding-before', 'padding-after'
    ];

    /**
     * Use old syntax for -moz- and -webkit-
     */
    prefixed(prop, prefix) {
        return prefix + (prop.indexOf('-start') !== -1 ?
            prop.replace('-block-start', '-before') :
            prop.replace('-block-end', '-after'));
    }

    /**
     * Return property name by spec
     */
    normalize(prop) {
        if (prop.indexOf('-before') !== -1) {
            return prop.replace('-before', '-block-start');
        } else {
            return prop.replace('-after', '-block-end');
        }
    }

}

module.exports = BlockLogical;
