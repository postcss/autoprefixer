const Declaration = require('../declaration');

class BorderRadius extends Declaration {

    static names = ['border-radius'];

    static toMozilla = {};
    static toNormal = {};

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

for (const ver of ['top', 'bottom']) {
    for (const hor of ['left', 'right']) {
        const normal = `border-${ver}-${hor}-radius`;
        const mozilla = `border-radius-${ver}${hor}`;

        BorderRadius.names.push(normal);
        BorderRadius.names.push(mozilla);

        BorderRadius.toMozilla[normal] = mozilla;
        BorderRadius.toNormal[mozilla] = normal;
    }
}

module.exports = BorderRadius;
