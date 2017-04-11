const Declaration = require('../declaration');

class BorderRadius extends Declaration {

    static initClass() {
        this.names = ['border-radius'];

        this.toMozilla = {};
        this.toNormal = {};
        for (const ver of ['top', 'bottom']) {
            for (const hor of ['left', 'right']) {
                const normal = `border-${ver}-${hor}-radius`;
                const mozilla = `border-radius-${ver}${hor}`;

                this.names.push(normal);
                this.names.push(mozilla);

                this.toMozilla[normal] = mozilla;
                this.toNormal[mozilla] = normal;
            }
        }
    }

    /**
     * Change syntax, when add Mozilla prefix
     */
    prefixed(prop, prefix) {
        if (prefix === '-moz-') {
            return prefix + (BorderRadius.toMozilla[prop] || prop);
        } else {
            return super.prefixed(prop, prefix);
        }
    }

    /**
     * Return unprefixed version of property
     */
    normalize(prop) {
        return BorderRadius.toNormal[prop] || prop;
    }

}

BorderRadius.initClass();

module.exports = BorderRadius;
