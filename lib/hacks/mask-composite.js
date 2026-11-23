let Browsers = require('../browsers')
let Declaration = require('../declaration')
let vendor = require('../vendor')

class MaskComposite extends Declaration {
  /**
   * Is the prefixed property already in the rule? The mask and
   * mask-composite properties belong together, so look past each other
   * until the next unprefixed declaration of the same property.
   */
  isAlready(decl, prefixed) {
    let nodes = decl.parent.nodes
    let index = nodes.indexOf(decl)
    for (let step of [-1, 1]) {
      for (let i = index + step; i >= 0 && i < nodes.length; i += step) {
        let other = nodes[i]
        if (other.type !== 'decl') continue
        if (other.prop === prefixed) return true
        if (!MaskComposite.names.includes(vendor.unprefixed(other.prop))) break
        if (other._autoprefixerMaskComposite) break
        if (other.prop === decl.prop && !Browsers.withPrefix(other.value)) break
      }
    }
    return false
  }

  /**
   * Prefix mask-composite for webkit
   */
  insert(decl, prefix, prefixes) {
    let isCompositeProp = decl.prop === 'mask-composite'

    let compositeValues

    if (isCompositeProp) {
      compositeValues = decl.value.split(',')
    } else {
      compositeValues = decl.value.match(MaskComposite.regexp) || []
    }

    compositeValues = compositeValues.map(el => el.trim()).filter(el => el)
    let hasCompositeValues = compositeValues.length

    let compositeDecl

    if (hasCompositeValues) {
      compositeDecl = this.clone(decl)
      compositeDecl.value = compositeValues
        .map(value => MaskComposite.oldValues[value] || value)
        .join(', ')

      if (compositeValues.includes('intersect')) {
        compositeDecl.value += ', xor'
      }

      compositeDecl.prop = prefix + 'mask-composite'
    }

    if (isCompositeProp) {
      if (!hasCompositeValues) {
        return undefined
      }

      if (this.needCascade(decl)) {
        compositeDecl.raws.before = this.calcBefore(prefixes, decl, prefix)
      }

      return decl.parent.insertBefore(decl, compositeDecl)
    }

    let cloned = this.clone(decl)
    cloned.prop = prefix + cloned.prop

    if (hasCompositeValues) {
      cloned.value = cloned.value.replace(MaskComposite.regexp, '')
    }

    if (this.needCascade(decl)) {
      cloned.raws.before = this.calcBefore(prefixes, decl, prefix)
    }

    decl.parent.insertBefore(decl, cloned)

    if (!hasCompositeValues) {
      return decl
    }

    if (this.needCascade(decl)) {
      compositeDecl.raws.before = this.calcBefore(prefixes, decl, prefix)
    }
    // A later mask-composite must not take this copy for the user's own
    decl._autoprefixerMaskComposite = true
    return decl.parent.insertBefore(decl, compositeDecl)
  }
}

MaskComposite.names = ['mask', 'mask-composite']

MaskComposite.oldValues = {
  add: 'source-over',
  exclude: 'xor',
  intersect: 'source-in',
  subtract: 'source-out'
}

MaskComposite.regexp = new RegExp(
  `\\s+(${Object.keys(MaskComposite.oldValues).join(
    '|'
  )})\\b(?!\\))\\s*(?=[,])`,
  'ig'
)

module.exports = MaskComposite
