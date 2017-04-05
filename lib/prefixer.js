const Browsers = require('./browsers');
const utils    = require('./utils');

const vendor = require('postcss/lib/vendor');

// Recursivly clone objects
var clone = function (obj, parent) {
    const cloned = new obj.constructor();

    for (let i of Object.keys(obj || {})) {
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
            cloned[i] = value.map(i => clone(i, cloned));
        } else if (i !== '_autoprefixerPrefix' && i !== '_autoprefixerValues') {
            if (typeof value === 'object' && value !== null) {
                value = clone(value, cloned);
            }
            cloned[i] = value;
        }
    }

    return cloned;
};

class Prefixer {
  // Add hack to selected names
    static hack(klass) {
        if (!this.hacks) {
            this.hacks = { };
        }
        return klass.names.map((name) =>
      this.hacks[name] = klass);
    }

  // Load hacks for some names
    static load(name, prefixes, all) {
        const klass = this.hacks != null ? this.hacks[name] : undefined;
        if (klass) {
            return new klass(name, prefixes, all);
        } else {
            return new this(name, prefixes, all);
        }
    }

  // Clone node and clean autprefixer custom caches
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

  // Find prefix in node parents
    parentPrefix(node) {
        let prefix = node._autoprefixerPrefix != null ?
      node._autoprefixerPrefix :

    node.type === 'decl' && node.prop[0] === '-' ?
      vendor.prefix(node.prop) :

    node.type === 'root' ?
      false :

    node.type === 'rule' &&
            node.selector.indexOf(':-') !== -1 && /:(-\w+-)/.test(node.selector) ?
      node.selector.match(/:(-\w+-)/)[1] :

    node.type === 'atrule' && node.name[0] === '-' ?
      vendor.prefix(node.name)    :
      this.parentPrefix(node.parent);

        if (Browsers.prefixes().indexOf(prefix) === -1) {
            prefix = false;
        }
        return node._autoprefixerPrefix = prefix;
    }

  // Clone node with prefixes
    process(node) {
        if (!this.check(node)) {
            return;
        }

        const parent   = this.parentPrefix(node);
        const prefixes = [];

        for (var prefix of this.prefixes) {
            if (parent && parent !== utils.removeNote(prefix)) {
                continue;
            }
            prefixes.push(prefix);
        }

        const added = [];
        for (prefix of prefixes) {
            if (this.add(node, prefix, added.concat([prefix]))) {
                added.push(prefix);
            }
        }

        return added;
    }

  // Shortcut for Prefixer.clone
    clone(node, overrides) {
        return Prefixer.clone(node, overrides);
    }
}

module.exports = Prefixer;
