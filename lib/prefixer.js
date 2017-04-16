const Browsers = require('./browsers');
const utils = require('./utils');

const vendor = require('postcss/lib/vendor');

/**
 * Recursivly clone objects
 */
function clone(obj, parent) {
    const cloned = new obj.constructor();

    for (const i of Object.keys(obj || {})) {
        let value = obj[i];
        if (i === 'parent' && typeof value === 'object') {
            if (parent) {
                cloned[i] = parent;
            }
        } else if (i === 'source') {
            cloned[i] = value;
        } else if (i === null) {
            cloned[i] = value;
        } else if (value instanceof Array) {
            cloned[i] = value.map(x => clone(x, cloned));
        } else if (i !== '_autoprefixerPrefix' && i !== '_autoprefixerValues') {
            if (typeof value === 'object' && value !== null) {
                value = clone(value, cloned);
            }
            cloned[i] = value;
        }
    }

    return cloned;
}

class Prefixer {

    /**
     * Add hack to selected names
     */
    static hack(klass) {
        if (!this.hacks) {
            this.hacks = {};
        }
        return klass.names.map((name) => {
            this.hacks[name] = klass;
            return this.hacks[name];
        });
    }

    /**
     * Load hacks for some names
     */
    static load(name, prefixes, all) {
        const Klass = this.hacks && this.hacks[name];
        if (Klass) {
            return new Klass(name, prefixes, all);
        } else {
            return new this(name, prefixes, all);
        }
    }

    /**
     * Clone node and clean autprefixer custom caches
     */
    static clone(node, overrides) {
        const cloned = clone(node);
        for (let name in overrides) {
            cloned[name] = overrides[name];
        }
        return cloned;
    }

    constructor(name, prefixes, all) {
        this.name = name;
        this.prefixes = prefixes;
        this.all = all;
    }

    /**
     * Find prefix in node parents
     */
    parentPrefix(node) {
        let prefix;

        if (typeof node._autoprefixerPrefix !== 'undefined') {
            prefix = node._autoprefixerPrefix;
        } else if (node.type === 'decl' && node.prop[0] === '-') {
            prefix = vendor.prefix(node.prop);
        } else if (node.type === 'root') {
            prefix = false;
        } else if (
            node.type === 'rule' &&
            node.selector.indexOf(':-') !== -1 &&
            /:(-\w+-)/.test(node.selector)
        ) {
            prefix = node.selector.match(/:(-\w+-)/)[1];
        } else if (node.type === 'atrule' && node.name[0] === '-') {
            prefix = vendor.prefix(node.name);
        } else {
            prefix = this.parentPrefix(node.parent);
        }


        if (Browsers.prefixes().indexOf(prefix) === -1) {
            prefix = false;
        }

        node._autoprefixerPrefix = prefix;

        return node._autoprefixerPrefix;
    }

    /**
     * Clone node with prefixes
     */
    process(node) {
        if (!this.check(node)) {
            return undefined;
        }

        const parent = this.parentPrefix(node);

        const prefixes = this.prefixes.filter(
            prefix => !parent || parent === utils.removeNote(prefix)
        );

        const added = [];
        for (const prefix of prefixes) {
            if (this.add(node, prefix, added.concat([prefix]))) {
                added.push(prefix);
            }
        }

        return added;
    }

    /**
     * Shortcut for Prefixer.clone
     */
    clone(node, overrides) {
        return Prefixer.clone(node, overrides);
    }

}

module.exports = Prefixer;
