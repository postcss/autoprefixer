const Declaration = require('../declaration');

const track = (start, end) => ({
    start,
    end,
    span: end - start
});

const sep = /['"]\s*['"]?/g;
const ws = /\s+/g;
const dots = /^\.+$/;

const getRows = tpl =>
    tpl
        .trim()
        .slice(1, -1)
        .split(sep);

const getColumns = line =>
    line
        .trim()
        .split(ws);

const reduceLines = (
    areas,
    line,
    rowIndex,
) => {
    if (line.trim() !== '') {
        getColumns(line).forEach((area, columnIndex) => {
            if (!dots.test(area)) {
                if (typeof areas[area] === 'undefined') {
                    areas[area] = {
                        column: track(columnIndex + 1, columnIndex + 2),
                        row: track(rowIndex + 1, rowIndex + 2)
                    };
                } else {
                    const { column, row } = areas[area];

                    column.start = Math.min(column.start, columnIndex + 1);
                    column.end = Math.max(column.end, columnIndex + 2);
                    column.span = column.end - column.start;

                    row.start = Math.min(row.start, rowIndex + 1);
                    row.end = Math.max(row.end, rowIndex + 2);
                    row.span = row.end - row.start;
                }
            }
        });
    }

    return areas;
};

const parseGridAreas = (tpl) => {
    const lines = getRows(tpl);
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
        if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes);

        const areas = parseGridAreas(decl.value);

        decl.root().walkDecls('grid-area', gridArea => {

            if (gridArea.parent.some(i => i.prop === '-ms-grid-row')) {
                return undefined;
            }

            const value = gridArea.value;
            const area = areas[value];
            delete areas[value];

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
