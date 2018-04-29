const Declaration = require('../declaration');
const {
    parseGridAreas,
    insertAreas,
    prefixTrackProp,
    prefixTrackValue
} = require('./grid-utils');


function getGridRows(tpl) {
    return tpl.trim().slice(1, -1).split(/['"]\s*['"]?/g);
}

function getMassage(dir) {
    return `Can not impliment grid-gap without grid-tamplate-${dir}`;
}

class GridTemplateAreas extends Declaration {

    static names = ['grid-template-areas'];

    /**
     * Translate grid-template-areas to separate -ms- prefixed properties
     */
    insert(decl, prefix, prefixes, result) {
        if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes);

        let hasColumns = false;
        let hasRows = false;
        let gap = {};
        const parent = decl.parent;

        // try to find gap
        parent.walkDecls(/grid(-(row|column))?-gap/, ({ prop, value }) => {
            if (prop === 'grid-gap') {
                gap.column = value;
                gap.row = value;
            }
            if (prop === 'grid-row-gap') gap.row = value;
            if (prop === 'grid-column-gap') gap.column = value;
        });

        // remove already prefixed rows and columns
        // without gutter to prevent doubling prefixes
        parent.walkDecls(/-ms-grid-(rows|columns)/, i => i.remove());

        // add empty tracks to rows and columns
        parent.walkDecls(/grid-template-(rows|columns)/, (trackDecl) => {
            if (trackDecl.prop === 'grid-template-rows') {
                hasRows = true;
                const { prop, value } = trackDecl;
                trackDecl.cloneBefore({
                    prop: prefixTrackProp({ prop, prefix }),
                    value: prefixTrackValue({ value, gap: gap.row })
                });
            } else {
                hasColumns = true;
                const { prop, value } = trackDecl;
                trackDecl.cloneBefore({
                    prop: prefixTrackProp({ prop, prefix }),
                    value: prefixTrackValue({ value, gap: gap.column })
                });
            }
        });


        // warnings
        const hasBothGaps = gap.row && gap.column;
        // console.log('='.repeat(20));
        // console.log({ hasRows, hasBothGaps, gap });
        // console.log('='.repeat(20));
        if (!hasRows && (hasBothGaps || gap.row && !gap.column)) {
            delete gap.row;
            decl.warn(result, getMassage('rows'));
        }

        if (!hasColumns && (hasBothGaps || gap.column && !gap.row)) {
            delete gap.column;
            decl.warn(result, getMassage('columns'));
        }

        const areas = parseGridAreas({
            rows: getGridRows(decl.value),
            gap
        });

        insertAreas(areas, decl, result);

        return decl;
    }
}

module.exports = GridTemplateAreas;
