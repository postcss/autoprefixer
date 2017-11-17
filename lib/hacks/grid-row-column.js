const Declaration = require('../declaration');
const shorthand = require('./grid-shorthand');

class GridRowColumn extends Declaration {

    static names = ['grid-row', 'grid-column'];

    /**
     * Translate grid-row / grid-column to separate -ms- prefixed properties
     */
    insert(decl, prefix, prefixes) {
        if (prefix !== '-ms-') {
            return super.insert(decl, prefix, prefixes);
        }

        if (!shorthand.isAlreadyApplied(decl, '-ms-' + decl.prop)) {
            return undefined;
        }

        const values = shorthand.parse(decl);

        const [start, span] = shorthand.translate(values, 0, 1);

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
