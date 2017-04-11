const Selector = require('../selector');

class Placeholder extends Selector {

    static names = [':placeholder-shown', '::placeholder'];

    /**
     * Add old mozilla to possible prefixes
     */
    possible() {
        return super.possible().concat('-moz- old');
    }

    /**
     * Return different selectors depend on prefix
     */
    prefixed(prefix) {
        if (prefix === '-webkit-') {
            return '::-webkit-input-placeholder';
        } else if (prefix === '-ms-') {
            return ':-ms-input-placeholder';
        } else if (prefix === '-moz- old') {
            return ':-moz-placeholder';
        } else {
            return `::${prefix}placeholder`;
        }
    }

}

module.exports = Placeholder;
