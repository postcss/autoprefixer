const flexSpec = require('./flex-spec');
const Declaration = require('../declaration');

class AlignSelf extends Declaration {

    static names = ['align-self', 'flex-item-align'];

    static oldValues = {
        'flex-end': 'end',
        'flex-start': 'start'
    };

    /**
     * Change property name for 2012 specs
     */
    prefixed(prop, prefix) {
        let spec;
        [spec, prefix] = flexSpec(prefix);
        if (spec === 2012) {
            return prefix + 'flex-item-align';
        } else {
            return super.prefixed(prop, prefix);
        }
    }

    /**
     * Return property name by final spec
     */
    normalize() {
        return 'align-self';
    }

    /**
     * Change value for 2012 spec and ignore prefix for 2009
     */
    set(decl, prefix) {
        const spec = flexSpec(prefix)[0];
        if (spec === 2012) {
            decl.value = AlignSelf.oldValues[decl.value] || decl.value;
            return super.set(decl, prefix);
        } else if (spec === 'final') {
            return super.set(decl, prefix);
        }
        return undefined;
    }

}

module.exports = AlignSelf;
