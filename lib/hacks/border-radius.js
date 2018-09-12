let Declaration = require('../declaration')

class BorderRadius extends Declaration {
  static names = ['border-radius']

  static toMozilla = {}
  static toNormal = {}

  /**
   * Change syntax, when add Mozilla prefix
   */
  prefixed (prop, prefix) {
    if (prefix === '-moz-') {
      return prefix + (BorderRadius.toMozilla[prop] || prop)
    }
    return super.prefixed(prop, prefix)
  }

  /**
   * Return unprefixed version of property
   */
  normalize (prop) {
    return BorderRadius.toNormal[prop] || prop
  }
}

for (let ver of ['top', 'bottom']) {
  for (let hor of ['left', 'right']) {
    let normal = `border-${ ver }-${ hor }-radius`
    let mozilla = `border-radius-${ ver }${ hor }`

    BorderRadius.names.push(normal)
    BorderRadius.names.push(mozilla)

    BorderRadius.toMozilla[normal] = mozilla
    BorderRadius.toNormal[mozilla] = normal
  }
}

module.exports = BorderRadius
