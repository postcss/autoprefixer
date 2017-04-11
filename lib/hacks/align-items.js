const flexSpec = require('./flex-spec');
const Declaration = require('../declaration');

class AlignItems extends Declaration {

    static names = ['align-items', 'flex-align', 'box-align'];

    static oldValues = {
        'flex-end': 'end',
        'flex-start': 'start'
    };

    /**
     * Change property name for 2009 and 2012 specs
     */
    prefixed(prop, prefix) {
        let spec;
        [spec, prefix] = flexSpec(prefix);
        if (spec === 2009) {
            return prefix + 'box-align';
        } else if (spec === 2012) {
            return prefix + 'flex-align';
        } else {
            return super.prefixed(prop, prefix);
        }
    }

    /**
     * Return property name by final spec
     */
    normalize() {
        return 'align-items';
    }

    /**
     * Change value for 2009 and 2012 specs
     */
    set(decl, prefix) {
        const spec = flexSpec(prefix)[0];
        if (spec === 2009 || spec === 2012) {
            decl.value = AlignItems.oldValues[decl.value] || decl.value;
        }
        return super.set(decl, prefix);
    }

}

module.exports = AlignItems;
