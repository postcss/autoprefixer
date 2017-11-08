const Declaration = require('../declaration');
const shorthand = require('./grid-shorthand');

class GridRowColumn extends Declaration {

    static names = ['grid-row', 'grid-column'];

    /**
     * Check if -ms-grid-{row|column} is already present
     */
    isAlreadyApplied(decl) {
        for (const i in decl.parent.nodes) {
            if (decl.parent.nodes.hasOwnProperty(i)) {
                const element = decl.parent.nodes[i];
                if (element.prop === '-ms-' + decl.prop) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Translate grid-row / grid-column to separate -ms- prefixed properties
     */
    insert(decl, prefix, prefixes) {
        if (prefix !== '-ms-') {
            return super.insert(decl, prefix, prefixes);
        }

        if (!this.isAlreadyApplied(decl)) {
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
