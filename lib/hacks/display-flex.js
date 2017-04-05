const flexSpec = require('./flex-spec');
const OldValue = require('../old-value');
const Value    = require('../value');

class DisplayFlex extends Value {
    static initClass() {
        this.names = ['display-flex', 'inline-flex'];
    }

    constructor(name, prefixes) {
        super(...arguments);
        if (name === 'display-flex') {
            this.name = 'flex';
        }
    }

  // Faster check for flex value
    check(decl) {
        return decl.prop === 'display' && decl.value === this.name;
    }

  // Return value by spec
    prefixed(prefix) {
        let spec;
        [spec, prefix] = Array.from(flexSpec(prefix));

        return prefix + (() => {
            if (spec === 2009) {
                if (this.name === 'flex') {
                    return 'box';
                } else {
                    return 'inline-box';
                }
            } else if (spec === 2012) {
                if (this.name === 'flex') {
                    return 'flexbox';
                } else {
                    return 'inline-flexbox';
                }
            } else if (spec ===  'final') {
                return this.name;
            }
        })();
    }

  // Add prefix to value depend on flebox spec version
    replace(string, prefix) {
        return this.prefixed(prefix);
    }

  // Change value for old specs
    old(prefix) {
        const prefixed = this.prefixed(prefix);
        if (prefixed) {
            return new OldValue(this.name, prefixed);
        }
    }
}
DisplayFlex.initClass();

module.exports = DisplayFlex;
