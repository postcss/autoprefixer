const Declaration = require('../declaration');
const {
    parseGridAreas,
    insertAreas
} = require('./grid-utils');


function getGridRows(tpl) {
    return tpl.trim().slice(1, -1).split(/['"]\s*['"]?/g);
}

class GridTemplateAreas extends Declaration {

    static names = ['grid-template-areas'];

    /**
     * Translate grid-template-areas to separate -ms- prefixed properties
     */
    insert(decl, prefix, prefixes, result) {
        if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes);

        const areas = parseGridAreas(getGridRows(decl.value));

        insertAreas(areas, decl, result);

        return decl;
    }
}

module.exports = GridTemplateAreas;
