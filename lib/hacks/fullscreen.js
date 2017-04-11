const Selector = require('../selector');

class Fullscreen extends Selector {

    static initClass() {
        this.names = [':fullscreen'];
    }

    /**
     * Return different selectors depend on prefix
     */
    prefixed(prefix) {
        if (prefix === '-webkit-') {
            return ':-webkit-full-screen';
        } else if (prefix === '-moz-') {
            return ':-moz-full-screen';
        } else {
            return `:${prefix}fullscreen`;
        }
    }

}

Fullscreen.initClass();

module.exports = Fullscreen;
