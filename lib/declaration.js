const Prefixer = require('./prefixer');
const Browsers = require('./browsers');
const utils    = require('./utils');

class Declaration extends Prefixer {

  // Always true, because we already get prefixer by property name
    check(decl) {
        return true;
    }

  // Return prefixed version of property
    prefixed(prop, prefix) {
        return prefix + prop;
    }

  // Return unprefixed version of property
    normalize(prop) {
        return prop;
    }

  // Check `value`, that it contain other prefixes, rather than `prefix`
    otherPrefixes(value, prefix) {
        for (let other of Browsers.prefixes()) {
            if (other === prefix) {
                continue;
            }
            if (value.indexOf(other) !== -1) {
                return true;
            }
        }
        return false;
    }

  // Set prefix to declaration
    set(decl, prefix) {
        decl.prop = this.prefixed(decl.prop, prefix);
        return decl;
    }

  // Should we use visual cascade for prefixes
    needCascade(decl) {
        return decl._autoprefixerCascade || (decl._autoprefixerCascade = this.all.options.cascade !== false &&
                                  decl.raw('before').indexOf('\n') !== -1);
    }

  // Return maximum length of possible prefixed property
    maxPrefixed(prefixes, decl) {
        if (decl._autoprefixerMax) {
            return decl._autoprefixerMax;
        }

        let max = 0;
        for (let prefix of prefixes) {
            prefix = utils.removeNote(prefix);
            if (prefix.length > max) {
                max    = prefix.length;
            }
        }

        return decl._autoprefixerMax = max;
    }

  // Calculate indentation to create visual cascade
    calcBefore(prefixes, decl, prefix = '') {
        let before = decl.raw('before');
        const max    = this.maxPrefixed(prefixes, decl);
        const diff   = max - utils.removeNote(prefix).length;
        for (let i = 0, end = diff, asc = end >= 0; asc ? i < end : i > end; asc ? i++ : i--) {
            before += ' ';
        }
        return before;
    }

  // Remove visual cascade
    restoreBefore(decl) {
        const lines = decl.raw('before').split('\n');
        let min   = lines[lines.length - 1];

        this.all.group(decl).up((prefixed) => {
            const array = prefixed.raw('before').split('\n');
            const last  = array[array.length - 1];
            if (last.length < min.length) {
                return min   = last;
            }
        });

        lines[lines.length - 1] = min;
        return decl.raws.before = lines.join('\n');
    }

  // Clone and insert new declaration
    insert(decl, prefix, prefixes) {
        const cloned = this.set(this.clone(decl), prefix);
        if (!cloned) {
            return;
        }

        const already = decl.parent.some(i => i.prop === cloned.prop && i.value === cloned.value);
        if (already) {
            return;
        }

        if (this.needCascade(decl)) {
            cloned.raws.before = this.calcBefore(prefixes, decl, prefix);
        }
        return decl.parent.insertBefore(decl, cloned);
    }

  // Did this declaration has this prefix above
    isAlready(decl, prefixed) {
        let already   = this.all.group(decl).up(i => i.prop === prefixed);
        if (!already) {
            already = this.all.group(decl).down(i => i.prop === prefixed);
        }
        return already;
    }

  // Clone and add prefixes for declaration
    add(decl, prefix, prefixes) {
        const prefixed = this.prefixed(decl.prop, prefix);
        if (this.isAlready(decl, prefixed) || this.otherPrefixes(decl.value, prefix)) {
            return;
        }
        return this.insert(decl, prefix, prefixes);
    }

  // Add spaces for visual cascade
    process(decl) {
        if (this.needCascade(decl)) {
            const prefixes = super.process(...arguments);
            if (prefixes != null ? prefixes.length : undefined) {
                this.restoreBefore(decl);
                return decl.raws.before = this.calcBefore(prefixes, decl);
            }
        } else {
            return super.process(...arguments);
        }
    }

  // Return list of prefixed properties to clean old prefixes
    old(prop, prefix) {
        return [this.prefixed(prop, prefix)];
    }
}

module.exports = Declaration;
