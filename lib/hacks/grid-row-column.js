const Declaration = require('../declaration');
const utils = require('./grid-utils');

class GridRowColumn extends Declaration {

    static names = ['grid-row', 'grid-column'];

    /**
     * Translate grid-row / grid-column to separate -ms- prefixed properties
     */
    insert(decl, prefix, prefixes) {
        if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes);

        const values = utils.parse(decl);
        const [start, span] = utils.translate(values, 0, 1);

        if (start) {
            decl.cloneBefore({
                prop: `-ms-${decl.prop}`,
                value: start.toString()
            });
        }

        if (span) {
            decl.cloneBefore({
                prop: `-ms-${decl.prop}-span`,
                value: span.toString()
            });
        }

        return undefined;
    }
}

module.exports = GridRowColumn;
