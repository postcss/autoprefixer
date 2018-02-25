const parser = require('postcss-value-parser');

function convert(value) {
    if (value &&
        value.length === 2 &&
        value[0] === 'span' &&
        parseInt(value[1], 10) > 0
    ) {
        return [false, parseInt(value[1], 10)];
    }

    if (value &&
        value.length === 1 &&
        parseInt(value[0], 10) > 0
    ) {
        return [parseInt(value[0], 10), false];
    }

    return [false, false];
}

function translate(values, startIndex, endIndex) {
    const startValue = values[startIndex];
    const endValue = values[endIndex];

    if (!startValue) {
        return [false, false];
    }

    const [start, spanStart] = convert(startValue);
    const [end, spanEnd] = convert(endValue);

    if (start && !endValue) {
        return [start, false];
    }

    if (spanStart && end) {
        return [end - spanStart, spanStart];
    }

    if (start && spanEnd) {
        return [start, spanEnd];
    }

    if (start && end) {
        return [start, end - start];
    }

    return [false, false];
}

function parse(decl) {
    const node = parser(decl.value);

    let values = [];
    let current = 0;
    values[current] = [];

    for (const i of node.nodes) {
        if (i.type === 'div') {
            current += 1;
            values[current] = [];
        } else if (i.type === 'word') {
            values[current].push(i.value);
        }
    }

    return values;
}

function insertDecl(decl, prop, value) {
    if (value && !decl.parent.some(i => i.prop === `-ms-${prop}`)) {
        decl.cloneBefore({
            prop: `-ms-${prop}`,
            value: value.toString()
        });
    }
}

// Transform repeat

function transformRepeat({ nodes }) {
    const repeat = nodes.reduce((result, node) => {
        if (node.type === 'div' && node.value === ',') {
            result.key = 'function';
        } else {
            result[result.key].push(parser.stringify(node));
        }
        return result;
    }, {
        key: 'count',
        function: [],
        count: []
    });
    return `(${repeat.function.join('')})[${repeat.count.join('')}]`;
}

function changeRepeat(value) {
    const result = parser(value)
        .nodes
        .map(i => {
            if (i.type === 'function' && i.value === 'repeat') {
                return {
                    type: 'word',
                    value: transformRepeat(i)
                };
            }
            return i;
        });
    return parser.stringify(result);
}


// Parse grid-template-areas

const DOTS = /^\.+$/;

function track(start, end) {
    return { start, end, span: end - start };
}

function getColumns(line) {
    return line.trim().split(/\s+/g);
}

function parseGridAreas(rows) {
    return rows.reduce((areas, line, rowIndex) => {
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


// Parse grid-template

function testTrack(node) {
    return node.type === 'word' && /^\[.+\]$/.test(node.value);
}

function parseTemplate(decl) {
    const gridTemplate = parser(decl.value)
        .nodes
        .reduce((result, node) => {
            const { type, value } = node;

            if (testTrack(node) || type === 'space') return result;

            // area
            if (type === 'string') {
                result.areas.push(value);
            }

            // values and function
            if (type === 'word' || type === 'function') {
                if (type === 'function' && value === 'repeat') {
                    result[result.key].push(transformRepeat(node));
                } else {
                    result[result.key].push(parser.stringify(node));
                }
            }

            // devider(/)
            if (type === 'div' && value === '/') {
                result.key = 'columns';
            }

            return result;
        }, {
            key: 'rows',
            columns: [],
            rows: [],
            areas: []
        });
    return {
        areas: parseGridAreas(gridTemplate.areas),
        columns: gridTemplate.columns.join(' '),
        rows: gridTemplate.rows.join(' ')
    };
}


// Insert parsed grid areas

function getRoot(parent) {
    if (parent.type === 'atrule' || !parent.parent)  {
        return parent;
    }
    return getRoot(parent.parent);
}

function insertAreas(areas, decl, result) {
    let missed = Object.keys(areas);

    getRoot(decl.parent).walkDecls('grid-area', gridArea => {
        const value = gridArea.value;
        const area = areas[value];

        missed = missed.filter(e => e !== value);

        if (area) {
            gridArea.parent
                .walkDecls(/-ms-grid-(row|column)/, (d) => {
                    d.remove();
                });

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

    if (missed.length > 0) {
        decl.warn(result, 'Can not find grid areas: ' + missed.join(', '));
    }
}

module.exports = {
    parse,
    translate,
    changeRepeat,
    parseTemplate,
    parseGridAreas,
    insertAreas,
    insertDecl
};
