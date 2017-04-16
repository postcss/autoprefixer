const OldValue = require('../old-value');
const Value = require('../value');
const utils = require('../utils');

const parser = require('postcss-value-parser');
const range = require('normalize-range');

const isDirection = /top|left|right|bottom/gi;

class Gradient extends Value {

    static names = [
        'linear-gradient', 'repeating-linear-gradient',
        'radial-gradient', 'repeating-radial-gradient'
    ];

    // Direction to replace
    directions = {
        top: 'bottom',
        left: 'right',
        bottom: 'top',
        right: 'left'
    };

    // Direction to replace
    oldDirections = {
        'top': 'left bottom, left top',
        'left': 'right top, left top',
        'bottom': 'left top, left bottom',
        'right': 'left top, right top',

        'top right': 'left bottom, right top',
        'top left': 'right bottom, left top',
        'right top': 'left bottom, right top',
        'right bottom': 'left top, right bottom',
        'bottom right': 'left top, right bottom',
        'bottom left': 'right top, left bottom',
        'left top': 'right bottom, left top',
        'left bottom': 'right top, left bottom'
    };

    /**
     * Change degrees for webkit prefix
     */
    replace(string, prefix) {
        const ast = parser(string);
        for (const node of ast.nodes) {
            if (node.type === 'function' && node.value === this.name) {
                node.nodes = this.newDirection(node.nodes);
                node.nodes = this.normalize(node.nodes);
                if (prefix === '-webkit- old') {
                    const changes = this.oldWebkit(node);
                    if (!changes) {
                        return undefined;
                    }
                } else {
                    node.nodes = this.convertDirection(node.nodes);
                    node.value = prefix + node.value;
                }
            }
        }
        return ast.toString();
    }

    /**
     * Replace first token
     */
    replaceFirst(params, ...words) {
        const prefix = words.map((i) => {
            if (i === ' ') {
                return { type: 'space', value: i };
            } else {
                return { type: 'word', value: i };
            }
        });
        return prefix.concat(params.slice(1));
    }

    /**
     * Convert angle unit to deg
     */
    normalizeUnit(str, full) {
        const num = parseFloat(str);
        const deg = num / full * 360;
        return `${deg}deg`;
    }

    /**
     * Normalize angle
     */
    normalize(nodes) {
        if (!nodes[0]) {
            return nodes;
        }

        if (/-?\d+(.\d+)?grad/.test(nodes[0].value)) {
            nodes[0].value = this.normalizeUnit(nodes[0].value, 400);
        } else if (/-?\d+(.\d+)?rad/.test(nodes[0].value)) {
            nodes[0].value = this.normalizeUnit(nodes[0].value, 2 * Math.PI);
        } else if (/-?\d+(.\d+)?turn/.test(nodes[0].value)) {
            nodes[0].value = this.normalizeUnit(nodes[0].value, 1);
        } else if (nodes[0].value.indexOf('deg') !== -1) {
            let num = parseFloat(nodes[0].value);
            num = range.wrap(0, 360, num);
            nodes[0].value = `${num}deg`;
        }

        if (nodes[0].value === '0deg') {
            nodes = this.replaceFirst(nodes, 'to', ' ', 'top');
        } else if (nodes[0].value === '90deg') {
            nodes = this.replaceFirst(nodes, 'to', ' ', 'right');
        } else if (nodes[0].value === '180deg') {
            nodes = this.replaceFirst(nodes, 'to', ' ', 'bottom');
        } else if (nodes[0].value === '270deg') {
            nodes = this.replaceFirst(nodes, 'to', ' ', 'left');
        }

        return nodes;
    }

    /**
     * Replace old direction to new
     */
    newDirection(params) {
        if (params[0].value === 'to') {
            return params;
        }
        if (!isDirection.test(params[0].value)) {
            return params;
        }

        params.unshift({
            type: 'word',
            value: 'to'
        }, {
            type: 'space',
            value: ' '
        });

        for (let i = 2; i < params.length; i++) {
            if (params[i].type === 'div') {
                break;
            }
            if (params[i].type === 'word') {
                params[i].value = this.revertDirection(params[i].value);
            }
        }

        return params;
    }

    /**
     * Change new direction to old
     */
    convertDirection(params) {
        if (params.length > 0) {
            if (params[0].value === 'to') {
                this.fixDirection(params);
            } else if (params[0].value.indexOf('deg') !== -1) {
                this.fixAngle(params);
            } else if (params[2].value === 'at') {
                this.fixRadial(params);
            }
        }
        return params;
    }

    /**
     * Replace `to top left` to `bottom right`
     */
    fixDirection(params) {
        params.splice(0, 2);

        for (const param of params) {
            if (param.type === 'div') {
                break;
            }
            if (param.type === 'word') {
                param.value = this.revertDirection(param.value);
            }
        }
    }

    /**
     * Add 90 degrees
     */
    fixAngle(params) {
        let first = params[0].value;
        first = parseFloat(first);
        first = Math.abs(450 - first) % 360;
        first = this.roundFloat(first, 3);
        params[0].value = `${first}deg`;
    }

    /**
     * Fix radial direction syntax
     */
    fixRadial(params) {
        const first = params[0];
        const second = [];
        let i;

        for (i = 4; i < params.length; i++) {
            if (params[i].type === 'div') {
                break;
            } else {
                second.push(params[i]);
            }
        }

        params.splice(0, i, ...second, params[i + 2], first);
    }

    revertDirection(word) {
        return this.directions[word.toLowerCase()] || word;
    }

    /**
     * Round float and save digits under dot
     */
    roundFloat(float, digits) {
        return parseFloat(float.toFixed(digits));
    }

    /**
     * Convert to old webkit syntax
     */
    oldWebkit(node) {
        const { nodes } = node;
        const string = parser.stringify(node.nodes);

        if (this.name !== 'linear-gradient') {
            return false;
        }
        if (nodes[0] && nodes[0].value.indexOf('deg') !== -1) {
            return false;
        }
        if (string.indexOf('px') !== -1) {
            return false;
        }
        if (string.indexOf('-corner') !== -1) {
            return false;
        }
        if (string.indexOf('-side') !== -1) {
            return false;
        }

        const params = [[]];
        for (const i of nodes) {
            params[params.length - 1].push(i);
            if (i.type === 'div' && i.value === ',') {
                params.push([]);
            }
        }

        this.oldDirection(params);
        this.colorStops(params);

        node.nodes = [];
        for (const param of params) {
            node.nodes = node.nodes.concat(param);
        }

        node.nodes.unshift(
            { type: 'word', value: 'linear' },
            this.cloneDiv(node.nodes));
        node.value = '-webkit-gradient';

        return true;
    }

    /**
     * Change direction syntax to old webkit
     */
    oldDirection(params) {
        const div = this.cloneDiv(params[0]);

        if (params[0][0].value !== 'to') {
            return params.unshift([
                { type: 'word', value: this.oldDirections.bottom },
                div
            ]);

        } else {
            let words = [];
            for (let node of params[0].slice(2)) {
                if (node.type === 'word') {
                    words.push(node.value.toLowerCase());
                }
            }

            words = words.join(' ');
            const old = this.oldDirections[words] || words;

            params[0] = [{ type: 'word', value: old }, div];
            return params[0];
        }
    }

    /**
     * Get div token from exists parameters
     */
    cloneDiv(params) {
        for (let i of params) {
            if (i.type === 'div' && i.value === ',') {
                return i;
            }
        }
        return { type: 'div', value: ',', after: ' ' };
    }

    /**
     * Change colors syntax to old webkit
     */
    colorStops(params) {
        const result = [];
        for (let i = 0; i < params.length; i++) {
            let pos;
            const param = params[i];
            let item;
            if (i === 0) {
                continue;
            }

            const color = parser.stringify(param[0]);
            if (param[1] && param[1].type === 'word') {
                pos = param[1].value;
            } else if (param[2] && param[2].type === 'word') {
                pos = param[2].value;
            }

            let stop;
            if (i === 1 && (!pos || pos === '0%')) {
                stop = `from(${color})`;
            } else if (i === params.length - 1 && (!pos || pos === '100%')) {
                stop = `to(${color})`;
            } else if (pos) {
                stop = `color-stop(${pos}, ${color})`;
            } else {
                stop = `color-stop(${color})`;
            }

            const div = param[param.length - 1];
            params[i] = [{ type: 'word', value: stop }];
            if (div.type === 'div' && div.value === ',') {
                item = params[i].push(div);
            }
            result.push(item);
        }
        return result;
    }

    /**
     * Remove old WebKit gradient too
     */
    old(prefix) {
        if (prefix === '-webkit-') {
            const type = this.name === 'linear-gradient' ? 'linear' : 'radial';
            const string = '-gradient';
            const regexp = utils.regexp(
                `-webkit-(${type}-gradient|gradient\\(\\s*${type})`, false
            );

            return new OldValue(this.name, prefix + this.name, string, regexp);
        } else {
            return super.old(prefix);
        }
    }

    /**
     * Do not add non-webkit prefixes for list-style and object
     */
    add(decl, prefix) {
        const p = decl.prop;
        if (p.indexOf('mask') !== -1) {
            if (prefix === '-webkit-' || prefix === '-webkit- old') {
                return super.add(decl, prefix);
            }
        } else if (p === 'list-style' ||
                   p === 'list-style-image' ||
                   p === 'content') {
            if (prefix === '-webkit-' || prefix === '-webkit- old') {
                return super.add(decl, prefix);
            }
        } else {
            return super.add(decl, prefix);
        }
        return undefined;
    }

}

module.exports = Gradient;
