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

// Track transforms

function prefixTrackProp({ prop, prefix }) {
    return prefix + prop.replace('template-', '');
}

function transformRepeat({ nodes }, { gap }) {
    const {
        count,
        size
    } = nodes.reduce((result, node) => {
        if (node.type === 'div' && node.value === ',') {
            result.key = 'size';
        } else {
            result[result.key].push(parser.stringify(node));
        }
        return result;
    }, {
        key: 'count',
        size: [],
        count: []
    });

    if (gap) {
        const val = [];
        for (let i = 1; i <= count; i++) {
            if (gap && i > 1) {
                val.push(gap);
            }
            val.push(size.join());
        }
        return val.join(' ');
    }

    return `(${size.join('')})[${count.join('')}]`;
}

function prefixTrackValue({ value, gap }) {
    const result = parser(value)
        .nodes
        .reduce((nodes, node) => {
            if (node.type === 'function' && node.value === 'repeat') {
                return nodes.concat({
                    type: 'word',
                    value: transformRepeat(node, { gap })
                });
            }
            if (gap && node.type === 'space') {
                return nodes.concat({
                    type: 'space',
                    value: ' '
                }, {
                    type: 'word',
                    value: gap
                }, node);
            }
            return nodes.concat(node);
        }, []);

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

function parseGridAreas({
    rows,
    gap
}) {
    return rows.reduce((areas, line, rowIndex) => {

        if (gap.row) rowIndex *= 2;

        if (line.trim() === '') return areas;

        getColumns(line).forEach((area, columnIndex) => {

            if (DOTS.test(area)) return;

            if (gap.column) columnIndex *= 2;

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

function verifyRowSize(result) {
    if (result.areas.length > result.rows.length) {
        result.rows.push('auto');
    }
    return result;
}

function parseTemplate({
    decl,
    gap
}) {
    const gridTemplate = parser(decl.value)
        .nodes
        .reduce((result, node) => {
            const { type, value } = node;

            if (testTrack(node) || type === 'space') return result;

            // area
            if (type === 'string') {
                result = verifyRowSize(result);
                result.areas.push(value);
            }

            // values and function
            if (type === 'word' || type === 'function') {
                result[result.key].push(parser.stringify(node));
            }

            // devider(/)
            if (type === 'div' && value === '/') {
                result.key = 'columns';
                result = verifyRowSize(result);
            }

            return result;
        }, {
            key: 'rows',
            columns: [],
            rows: [],
            areas: []
        });

    return {
        areas: parseGridAreas({
            rows: gridTemplate.areas,
            gap
        }),
        columns: prefixTrackValue({
            value: gridTemplate.columns.join(' '),
            gap: gap.column
        }),
        rows: prefixTrackValue({
            value: gridTemplate.rows.join(' '),
            gap: gap.row
        })
    };
}


// Insert parsed grid areas

function getMSDecls(area) {
    return [].concat(
        {
            prop: '-ms-grid-row',
            value: String(area.row.start)
        },
        area.row.span > 1 ? {
            prop: '-ms-grid-row-span',
            value: String(area.row.span)
        } : [],
        {
            prop: '-ms-grid-column',
            value: String(area.column.start)
        },
        area.column.span > 1 ? {
            prop: '-ms-grid-column-span',
            value: String(area.column.span)
        } : []
    );
}

function getParentMedia(parent) {
    if (parent.type === 'atrule' && parent.name === 'media') {
        return parent;
    } else if (!parent.parent) {
        return false;
    }
    return getParentMedia(parent.parent);
}

function insertAreas(areas, decl, result) {
    let missed = Object.keys(areas);

    const parentMedia = getParentMedia(decl.parent);

    decl.root().walkDecls('grid-area', gridArea => {

        const value = gridArea.value;
        const area = areas[value];

        missed = missed.filter(e => e !== value);

        if (area && parentMedia) {

            // skip if grid-template-areas already prefixed in media
            if (parentMedia.some(
                i => i.selector === gridArea.parent.selector
            )) {
                return undefined;
            }

            // create new rule
            const rule = decl.parent.clone({
                selector: gridArea.parent.selector
            });
            rule.removeAll();

            // insert prefixed decls in new rule
            getMSDecls(area)
                .forEach(i => rule.append(
                    Object.assign(i, {
                        raws: {
                            between: gridArea.raws.between
                        }
                    })
                ));

            // insert new rule with prefixed decl to existing media
            parentMedia.append(rule);

            return undefined;
        }

        if (area) {
            gridArea.parent
                .walkDecls(/-ms-grid-(row|column)/, (d) => {
                    d.remove();
                });

            // insert prefixed decls before grid-area
            getMSDecls(area).forEach(i => gridArea.cloneBefore(i));
        }

        return undefined;
    });

    if (missed.length > 0) {
        decl.warn(result, 'Can not find grid areas: ' + missed.join(', '));
    }
}

// Gap utils

function getGridGap(decl) {

    let gap = {};

    // try to find gap
    decl.parent.walkDecls(/grid(-(row|column))?-gap/, ({ prop, value }) => {
        if (prop === 'grid-gap') {
            gap.column = value;
            gap.row = value;
        }
        if (prop === 'grid-row-gap') gap.row = value;
        if (prop === 'grid-column-gap') gap.column = value;
    });

    return gap;
}

function warnGridGap({
    gap,
    hasColumns,
    decl,
    result
}) {
    const hasBothGaps = gap.row && gap.column;
    if (!hasColumns && (hasBothGaps || gap.column && !gap.row)) {
        delete gap.column;
        decl.warn(
            result,
            'Can not impliment grid-gap without grid-tamplate-columns'
        );
    }
}

module.exports = {
    parse,
    translate,
    parseTemplate,
    parseGridAreas,
    insertAreas,
    insertDecl,
    prefixTrackProp,
    prefixTrackValue,
    getGridGap,
    warnGridGap
};
