const OldValue = require('../old-value');
const Value = require('../value');

function regexp(name) {
    return new RegExp(`(^|[\\s,(])(${name}($|[\\s),]))`, 'gi');
}

class Intrinsic extends Value {

    static names = [
        'max-content', 'min-content', 'fit-content',
        'fill', 'fill-available', 'stretch'
    ];

    regexp() {
        if (!this.regexpCache) this.regexpCache = regexp(this.name);
        return this.regexpCache;
    }

    isStretch() {
        return this.name === 'stretch' ||
               this.name === 'fill' ||
               this.name === 'fill-available';
    }

    replace(string, prefix) {
        if (prefix === '-moz-' && this.isStretch()) {
            return string.replace(this.regexp(), '$1-moz-available$3');
        } else if (prefix === '-webkit-' && this.isStretch()) {
            return string.replace(this.regexp(), '$1-webkit-fill-available$3');
        } else {
            return super.replace(string, prefix);
        }
    }

    old(prefix) {
        let prefixed = prefix + this.name;
        if (this.isStretch()) {
            if (prefix === '-moz-') {
                prefixed = '-moz-available';
            } else if (prefix === '-webkit-') {
                prefixed = '-webkit-fill-available';
            }
        }
        return new OldValue(this.name, prefixed, prefixed, regexp(prefixed));
    }

    /**
     * Do not add non-webkit prefixes for
     * 'grid', 'grid-template',
     * 'grid-template-rows', 'grid-template-columns',
     * 'grid-auto-columns', 'grid-auto-rows'
     */
    add(decl, prefix) {
        const p = decl.prop;
        if (p.indexOf('grid') !== -1) {
            if (prefix === '-webkit-' || prefix === '-webkit- old') {
                return super.add(decl, prefix);
            }
        } else {
            return super.add(decl, prefix);
        }
        return undefined;
    }

}

module.exports = Intrinsic;
