const flexSpec    = require('./flex-spec');
const Declaration = require('../declaration');

class AlignSelf extends Declaration {
    static initClass() {
        this.names = ['align-self', 'flex-item-align'];

        this.oldValues = {
            'flex-end':   'end',
            'flex-start': 'start'
        };
    }

  // Change property name for 2012 specs
    prefixed(prop, prefix) {
        let spec;
        [spec, prefix] = Array.from(flexSpec(prefix));
        if (spec === 2012) {
            return prefix + 'flex-item-align';
        } else {
            return super.prefixed(...arguments);
        }
    }

  // Return property name by final spec
    normalize(prop) {
        return 'align-self';
    }

  // Change value for 2012 spec and ignore prefix for 2009
    set(decl, prefix) {
        const spec = flexSpec(prefix)[0];
        if (spec === 2012) {
            decl.value = AlignSelf.oldValues[decl.value] || decl.value;
            return super.set(decl, prefix);
        } else if (spec === 'final') {
            return super.set(...arguments);
        }
    }
}
AlignSelf.initClass();

module.exports = AlignSelf;
