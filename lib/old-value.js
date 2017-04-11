const utils = require('./utils');

class OldValue {

    constructor(unprefixed, prefixed, string, regexp) {
        this.unprefixed = unprefixed;
        this.prefixed = prefixed;
        this.string = string || prefixed;
        this.regexp = regexp || utils.regexp(prefixed);
    }

    /**
     * Check, that value contain old value
     */
    check(value) {
        if (value.indexOf(this.string) !== -1) {
            return !!value.match(this.regexp);
        }
        return false;
    }

}

module.exports = OldValue;
