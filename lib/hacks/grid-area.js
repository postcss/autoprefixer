const Declaration = require('../declaration');
const shorthand = require('./grid-shorthand');

class GridArea extends Declaration {

    static names = ['grid-area'];

    /**
     * Check if -ms-grid-row is already present
     */
    isAlreadyApplied(decl) {
        for (const i in decl.parent.nodes) {
            if (decl.parent.nodes.hasOwnProperty(i)) {
                const element = decl.parent.nodes[i];
                if (element.prop === '-ms-grid-row') {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Translate grid-area to separate -ms- prefixed properties
     */
    insert(decl, prefix, prefixes) {
        if (prefix !== '-ms-') {
            return super.insert(decl, prefix, prefixes);
        }

        if (!this.isAlreadyApplied(decl)) {
            return undefined;
        }

        const values = shorthand.parse(decl);

        const [rowStart, rowSpan] = shorthand.translate(values, 0, 2);
        const [columnStart, columnSpan] = shorthand.translate(values, 1, 3);

        if (rowStart) {
            decl.cloneBefore({
                prop: '-ms-grid-row',
                value: rowStart.toString()
            });
        }

        if (rowSpan) {
            decl.cloneBefore({
                prop: '-ms-grid-row-span',
                value: rowSpan.toString()
            });
        }

        if (columnStart) {
            decl.cloneBefore({
                prop: '-ms-grid-column',
                value: columnStart.toString()
            });
        }

        if (columnSpan) {
            decl.cloneBefore({
                prop: '-ms-grid-column-span',
                value: columnSpan.toString()
            });
        }

        return undefined;
    }
}

module.exports = GridArea;
