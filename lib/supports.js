const Browsers = require('./browsers');
const brackets = require('./brackets');
const Value    = require('./value');
const utils    = require('./utils');

const postcss = require('postcss');

const supported = [];
const data = require('caniuse-lite').feature(
    require('caniuse-lite/data/features/css-featurequeries.js')
);
for (let browser in data.stats) {
    const versions = data.stats[browser];
    for (let version in versions) {
        const support = versions[version];
        if (/y/.test(support)) {
            supported.push(browser + ' ' + version);
        }
    }
}

class Supports {

    constructor(Prefixes, all) {
        this.Prefixes = Prefixes;
        this.all = all;
    }

    /**
     * Return prefixer only with @supports supported browsers
     */
    prefixer() {
        if (this.prefixerCache) {
            return this.prefixerCache;
        }

        const filtered = this.all.browsers.selected.filter(i => {
            return supported.indexOf(i) !== -1;
        });

        const browsers = new Browsers(
            this.all.browsers.data,
            filtered,
            this.all.options
        );
        this.prefixerCache = new this.Prefixes(
            this.all.data,
            browsers,
            this.all.options
        );
        return this.prefixerCache;
    }

    /**
     * Parse string into declaration property and value
     */
    parse(str) {
        let [prop, value] = str.split(':');
        if (!value) value = '';
        return [prop.trim(), value.trim()];
    }

    /**
     * Create virtual rule to process it by prefixer
     */
    virtual(str) {
        const [prop, value] = this.parse(str);
        const rule = postcss.parse('a{}').first;
        rule.append({ prop, value, raws: { before: '' } });
        return rule;
    }

    /**
     * Return array of Declaration with all necessary prefixes
     */
    prefixed(str) {
        const rule = this.virtual(str);
        if (this.disabled(rule.first)) {
            return rule.nodes;
        }

        const prefixer = this.prefixer().add[rule.first.prop];
        prefixer && prefixer.process && prefixer.process(rule.first);

        for (let decl of rule.nodes) {
            for (let value of this.prefixer().values('add', rule.first.prop)) {
                value.process(decl);
            }
            Value.save(this.all, decl);
        }

        return rule.nodes;
    }

    /**
     * Return true if brackets node is "not" word
     */
    isNot(node) {
        return typeof node === 'string' &&
            /not\s*/i.test(node);
    }

    /**
     * Return true if brackets node is "or" word
     */
    isOr(node) {
        return typeof node === 'string' &&
            /\s*or\s*/i.test(node);
    }

    /**
     * Return true if brackets node is (prop: value)
     */
    isProp(node) {
        return typeof node === 'object' &&
            node.length === 1 &&
            typeof node[0] === 'string';
    }

    /**
     * Return true if prefixed property has no unprefixed
     */
    isHack(all, unprefixed) {
        const check = new RegExp(`(\\(|\\s)${utils.escapeRegexp(unprefixed)}:`);
        return !check.test(all);
    }

    /**
     * Return true if we need to remove node
     */
    toRemove(str, all) {
        const [prop, value] = this.parse(str);
        const unprefixed = this.all.unprefixed(prop);

        const cleaner = this.all.cleaner();

        if (cleaner.remove[prop] &&
            cleaner.remove[prop].remove &&
            !this.isHack(all, unprefixed)
        ) {
            return true;
        }

        for (const checker of cleaner.values('remove', unprefixed)) {
            if (checker.check(value)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Remove all unnecessary prefixes
     */
    remove(nodes, all) {
        let i = 0;
        while (i < nodes.length) {
            if (!this.isNot(nodes[i - 1]) &&
                this.isProp(nodes[i]) &&
                this.isOr(nodes[i + 1])
            ) {
                if (this.toRemove(nodes[i][0], all)) {
                    nodes.splice(i, 2);
                } else {
                    i += 2;
                }
            } else {
                if (typeof nodes[i] === 'object') {
                    nodes[i] = this.remove(nodes[i], all);
                }
                i += 1;
            }
        }
        return nodes;
    }

    /**
     * Clean brackets with one child
     */
    cleanBrackets(nodes) {
        return nodes.map(i => {
            if (typeof i === 'object') {
                if (i.length === 1 && typeof i[0] === 'object') {
                    return this.cleanBrackets(i[0]);
                } else {
                    return this.cleanBrackets(i);
                }
            } else {
                return i;
            }
        });
    }

    /**
     * Add " or " between properties and convert it to brackets format
     */
    convert(progress) {
        const result = [''];
        for (let i of progress) {
            result.push([`${i.prop}: ${i.value}`]);
            result.push(' or ');
        }
        result[result.length - 1] = '';
        return result;
    }

    /**
     * Compress value functions into a string nodes
     */
    normalize(nodes) {
        if (typeof nodes === 'object') {
            nodes = nodes.filter(i => i !== '');
            if (typeof nodes[0] === 'string' && nodes[0].indexOf(':') !== -1) {
                return [brackets.stringify(nodes)];
            } else {
                return nodes.map(i => this.normalize(i));
            }
        } else {
            return nodes;
        }
    }

    /**
     * Add prefixes
     */
    add(nodes, all) {
        return nodes.map(i => {
            if (this.isProp(i)) {
                const prefixed = this.prefixed(i[0]);
                if (prefixed.length > 1) {
                    return this.convert(prefixed);
                } else {
                    return i;
                }
            } else if (typeof i === 'object') {
                return this.add(i, all);
            } else {
                return i;
            }
        });
    }

    /**
     * Add prefixed declaration
     */
    process(rule) {
        let ast = brackets.parse(rule.params);
        ast = this.normalize(ast);
        ast = this.remove(ast, rule.params);
        ast = this.add(ast, rule.params);
        ast = this.cleanBrackets(ast);
        rule.params = brackets.stringify(ast);
    }

    /**
     * Check global options
     */
    disabled(node) {
        if (this.all.options.grid === false) {
            if (node.prop === 'display' &&
                node.value.indexOf('grid') !== -1
            ) {
                return true;
            }
            if (node.prop.indexOf('grid') !== -1 ||
                node.prop === 'justify-items'
            ) {
                return true;
            }
        }

        if (this.all.options.flexbox === false) {
            if (node.prop === 'display' &&
                node.value.indexOf('flex') !== -1
            ) {
                return true;
            }
            const other = [
                'order',
                'justify-content',
                'align-items',
                'align-content'
            ];
            if (node.prop.indexOf('flex') !== -1 ||
                other.indexOf(node.prop) !== -1
            ) {
                return true;
            }
        }

        return false;
    }

}

module.exports = Supports;
