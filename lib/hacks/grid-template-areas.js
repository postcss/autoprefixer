const Declaration = require('../declaration');

const DOTS = /^\.+$/;

function track(start, end) {
    return { start, end, span: end - start };
}

function getRows(tpl) {
    return tpl.trim().slice(1, -1).split(/['"]\s*['"]?/g);
}

function getColumns(line) {
    return line.trim().split(/\s+/g);
}

function parseGridAreas(tpl) {
    return getRows(tpl).reduce((areas, line, rowIndex) => {
        if (line.trim() === '') return areas;
        getColumns(line).forEach((area, columnIndex) => {
            if (DOTS.test(area)) return;
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
        });
        return areas;
    }, {});
}

class GridTemplateAreas extends Declaration {

    static names = ['grid-template-areas'];

    getRoot(parent) {
        if (parent.type === 'atrule' || parent.type === 'root')  {
            return parent;
        }
        return this.getRoot(parent.parent);
    }

    /**
     * Translate grid-template-areas to separate -ms- prefixed properties
     */
    insert(decl, prefix, prefixes, result) {
        if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes);

        const areas = parseGridAreas(decl.value);
        const root = this.getRoot(decl.parent);
        root.walkDecls('grid-area', gridArea => {
            const value = gridArea.value;
            const area = areas[value];
            delete areas[value];

            if (gridArea.parent.some(i => i.prop === '-ms-grid-row')) {
                return undefined;
            }

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

        const missed = Object.keys(areas);
        if (missed.length > 0) {
            decl.warn(result, 'Can not find grid areas: ' + missed.join(', '));
        }

        return decl;
    }
}

module.exports = GridTemplateAreas;
