const Declaration = require('../declaration');

class Animation extends Declaration {

    static names = ['animation', 'animation-direction'];

    /**
     * Don’t add prefixes for modern values.
     */
    check(decl) {
        let found = false;
        decl.value.split(/\s+/).forEach(i => {
            const lower = i.toLowerCase();
            if (lower === 'reverse' || lower === 'alternate-reverse') {
                found = true;
                return false;
            } else {
                return true;
            }
        });
        return !found;
    }

}

module.exports = Animation;
