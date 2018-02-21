const Declaration = require('../declaration');
const utils = require('./grid-utils');

class GridTemplate extends Declaration {

    static names = [
        'grid-template'
    ];

    /**
     * Do not add prefix for unsupported value in IE
     */
    check(decl) {
        return decl.value.includes('/') &&
            !decl.value.includes('[') &&
            !decl.value.includes('"') &&
            !decl.value.includes('\'');
    }

    /**
     * Translate grid-template to separate -ms- prefixed properties
     */
    insert(decl, prefix, prefixes) {
        if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes);

        if (decl.parent.some(i => i.prop === '-ms-grid-rows')) {
            return undefined;
        }

        const [
            templateRows,
            templateColumns
        ] = utils.parseTemplateShortcut(decl);

        if (templateRows) {
            decl.cloneBefore({
                prop: '-ms-grid-rows',
                value: utils.changeRepeat(templateRows.join(''))
            });
        }

        if (templateColumns) {
            decl.cloneBefore({
                prop: '-ms-grid-columns',
                value: utils.changeRepeat(templateColumns.join(''))
            });
        }

        return decl;
    }
}

module.exports = GridTemplate;
