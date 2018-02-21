const Declaration = require('../declaration');
const utils = require('./grid-utils');

class GridArea extends Declaration {

    static names = ['grid-area'];

    /**
     * Translate grid-area to separate -ms- prefixed properties
     */
    insert(decl, prefix, prefixes) {
        if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes);

        if (decl.parent.some(i => i.prop === '-ms-grid-row')) {
            return undefined;
        }

        const values = utils.parse(decl);

        const [rowStart, rowSpan] = utils.translate(values, 0, 2);
        const [columnStart, columnSpan] = utils.translate(values, 1, 3);

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
