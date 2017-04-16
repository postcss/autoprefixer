const flexSpec = require('./flex-spec');
const Declaration = require('../declaration');

const list = require('postcss/lib/list');

class Flex extends Declaration {

    static names = ['flex', 'box-flex'];

    static oldValues = {
        auto: '1',
        none: '0'
    };

    /**
     * Change property name for 2009 spec
     */
    prefixed(prop, prefix) {
        let spec;
        [spec, prefix] = flexSpec(prefix);
        if (spec === 2009) {
            return prefix + 'box-flex';
        } else {
            return super.prefixed(prop, prefix);
        }
    }

    /**
     * Return property name by final spec
     */
    normalize() {
        return 'flex';
    }

    /**
     * Spec 2009 supports only first argument
     * Spec 2012 disallows unitless basis
     */
    set(decl, prefix) {
        const spec = flexSpec(prefix)[0];
        if (spec === 2009) {
            decl.value = list.space(decl.value)[0];
            decl.value = Flex.oldValues[decl.value] || decl.value;
            return super.set(decl, prefix);
        } else if (spec === 2012) {
            const components = list.space(decl.value);
            if (components.length === 3 && components[2] === '0') {
                decl.value = components.slice(0, 2).concat('0px').join(' ');
            }
        }
        return super.set(decl, prefix);
    }

}

module.exports = Flex;
