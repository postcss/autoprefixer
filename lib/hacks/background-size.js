const Declaration = require('../declaration');

class BackgroundSize extends Declaration {

    static names = ['background-size'];

    /**
     * Duplication parameter for -webkit- browsers
     */
    set(decl, prefix) {
        const value = decl.value.toLowerCase();
        if (prefix === '-webkit-' &&
            value.indexOf(' ') === -1 &&
            value !== 'contain' &&
            value !== 'cover'
        ) {
            decl.value = decl.value + ' ' + decl.value;
        }
        return super.set(decl, prefix);
    }

}

module.exports = BackgroundSize;
