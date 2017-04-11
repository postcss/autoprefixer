const parser = require('postcss-value-parser');

const Declaration = require('../declaration');

class GridTemplate extends Declaration {

    static names = [
        'grid-template-rows', 'grid-template-columns',
        'grid-rows', 'grid-columns'
    ];

    /**
     * Change property name for IE
     */
    prefixed(prop, prefix) {
        if (prefix === '-ms-') {
            return prefix + prop.replace('template-', '');
        } else {
            return super.prefixed(prop, prefix);
        }
    }

    /**
     * Change IE property back
     */
    normalize(prop) {
        return prop.replace(/^grid-(rows|columns)/, 'grid-template-$1');
    }

    /**
     * Recursive part of changeRepeat
     */
    walkRepeat(node) {
        const fixed = [];
        for (const i of node.nodes) {
            if (i.nodes) {
                this.walkRepeat(i);
            }
            fixed.push(i);
            if (i.type === 'function' && i.value === 'repeat') {
                const first = i.nodes.shift();
                if (first) {
                    const count = first.value;
                    i.nodes.shift();
                    i.value = '';
                    fixed.push({ type: 'word', value: `[${count}]` });
                }
            }
        }
        node.nodes = fixed;
    }

    /**
     * IE repeating syntax
     */
    changeRepeat(value) {
        const ast = parser(value);
        this.walkRepeat(ast);
        return ast.toString();
    }

    /**
     * Change repeating syntax for IE
     */
    set(decl, prefix) {
        if (prefix === '-ms-' && decl.value.indexOf('repeat(') !== -1) {
            decl.value = this.changeRepeat(decl.value);
        }
        return super.set(decl, prefix);
    }

}

module.exports = GridTemplate;
