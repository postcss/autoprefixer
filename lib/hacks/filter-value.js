const OldValue = require('../old-value');
const Value = require('../value');
const utils = require('../utils');

class OldFilterValue extends OldValue {

    /**
     * Clean -webkit-filter from properties list
     */
    clean(decl) {
        decl.value = utils.editList(decl.value, props => {
            if (props.every(i => i.indexOf(this.unprefixed) !== 0)) {
                return props;
            }
            return props.filter(i => i.indexOf(this.prefixed) === -1);
        });
    }

}

class FilterValue extends Value {

    static names = ['filter', 'filter-function'];

    constructor(name, prefixes) {
        super(name, prefixes);
        if (name === 'filter-function') {
            this.name = 'filter';
        }
    }

    /**
     * Use prefixed and unprefixed filter for WebKit
     */
    replace(value, prefix) {
        if (prefix === '-webkit-' && value.indexOf('filter(') === -1) {
            if (value.indexOf('-webkit-filter') === -1) {
                return super.replace(value, prefix) + ', ' + value;
            } else {
                return value;
            }
        } else {
            return super.replace(value, prefix);
        }
    }

    /**
     * Clean -webkit-filter
     */
    old(prefix) {
        return new OldFilterValue(this.name, prefix + this.name);
    }

}

module.exports = FilterValue;
