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

    add(decl, prefix) {
        if (decl.prop.indexOf('grid') !== -1 && prefix !== '-webkit-') {
            return undefined;
        }
        return super.add(decl, prefix);
    }

}

module.exports = Intrinsic;
