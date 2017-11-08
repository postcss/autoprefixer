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

/**
 * Translate values to start-span
 */
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

module.exports = {
    translate,
    parse
};
