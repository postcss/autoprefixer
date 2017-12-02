const Declaration = require('../declaration');
const shorthand = require('./grid-shorthand');

const track = (start, end) => ({
    start,
    end,
    span: end - start
});

const sep = /['"]\s*['"]?/g;
const ws = /\s+/g;

const cleanTpl = t => t.trim().slice(1, -1);
const cleanLine = l => l.replace(ws, ' ').trim();

const getTpl = t => cleanTpl(t).split(sep);
const getRow = l => cleanLine(l).split(' ');

const reduceLines = (
    acc,
    line,
    r,
) => {
    if (line.trim() !== '') {
        getRow(line).forEach((area, c) => {
            if (area !== '.') {
                if (typeof acc[area] === 'undefined') {
                    acc[area] = {
                        column: track(c + 1, c + 2),
                        row: track(r + 1, r + 2)
                    };
                } else {
                    const { column, row } = acc[area];

                    column.start = Math.min(column.start, c + 1);
                    column.end = Math.max(column.end, c + 2);
                    column.span = column.end - column.start;

                    row.start = Math.min(row.start, r + 1);
                    row.end = Math.max(row.end, r + 2);
                    row.span = row.end - row.start;
                }
            }
        });
    }

    return acc;
};

const parseGridAreas = (tpl) => {
    const lines = getTpl(tpl);
    const areas = lines.reduce(reduceLines, {});

    return areas;
};

class GridTemplateAreas extends Declaration {

    static names = [
        'grid-template-areas'
    ];

    /**
     * Translate grid-template-areas to separate -ms- prefixed properties
     */
    insert(decl, prefix, prefixes) {
        if (prefix !== '-ms-') {
            return super.insert(decl, prefix, prefixes);
        }

        const areas = parseGridAreas(decl.value);

        decl.root().walkDecls('grid-area', gridArea => {

            if (!shorthand.isAlreadyApplied(gridArea, '-ms-grid-row')) {
                return undefined;
            }

            const value = gridArea.value;
            const area = areas[value];

            if (area) {
                gridArea.cloneBefore({
                    prop: '-ms-grid-row',
                    value: String(area.row.start)
                });
                if (area.row.span > 1) {
                    gridArea.cloneBefore({
                        prop: '-ms-grid-row-span',
                        value: String(area.row.span)
                    });
                }
                gridArea.cloneBefore({
                    prop: '-ms-grid-column',
                    value: String(area.column.start)
                });
                if (area.column.span > 1) {
                    gridArea.cloneBefore({
                        prop: '-ms-grid-column-span',
                        value: String(area.column.span)
                    });
                }
            }
            return undefined;
        });

        return decl;
    }
}

module.exports = GridTemplateAreas;
