const Declaration = require('../declaration');
const {
    parseTemplate,
    insertAreas
} = require('./grid-utils');

class GridTemplate extends Declaration {

    static names = [
        'grid-template'
    ];


    /**
     * Translate grid-template to separate -ms- prefixed properties
     */
    insert(decl, prefix, prefixes, result) {
        if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes);

        if (decl.parent.some(i => i.prop === '-ms-grid-rows')) {
            return undefined;
        }

        const {
            rows,
            columns,
            areas
        } = parseTemplate(decl);
        const hasAreas = Object.keys(areas).length > 0;

        if (rows && columns || hasAreas) {
            decl.cloneBefore({
                prop: '-ms-grid-rows',
                value: rows
            });
        }

        if (columns) {
            decl.cloneBefore({
                prop: '-ms-grid-columns',
                value: columns
            });
        }

        if (hasAreas) {
            insertAreas(areas, decl, result);
        }

        return decl;
    }
}

module.exports = GridTemplate;
