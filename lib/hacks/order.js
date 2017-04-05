const flexSpec    = require('./flex-spec');
const Declaration = require('../declaration');

class Order extends Declaration {
    static initClass() {
        this.names = ['order', 'flex-order', 'box-ordinal-group'];
    }

  // Change property name for 2009 and 2012 specs
    prefixed(prop, prefix) {
        let spec;
        [spec, prefix] = Array.from(flexSpec(prefix));
        if (spec === 2009) {
            return prefix + 'box-ordinal-group';
        } else if (spec === 2012) {
            return prefix + 'flex-order';
        } else {
            return super.prefixed(...arguments);
        }
    }

  // Return property name by final spec
    normalize(prop) {
        return 'order';
    }

  // Fix value for 2009 spec
    set(decl, prefix) {
        const spec = flexSpec(prefix)[0];
        if (spec === 2009 && /\d/.test(decl.value)) {
            decl.value = (parseInt(decl.value) + 1).toString();
            return super.set(decl, prefix);
        } else {
            return super.set(...arguments);
        }
    }
}
Order.initClass();

module.exports = Order;
