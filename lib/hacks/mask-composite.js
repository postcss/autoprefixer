let Browsers = require('../browsers')
let Declaration = require('../declaration')
let vendor = require('../vendor')

class MaskComposite extends Declaration {
  /**
   * Autoprefixer skips a declaration when its prefixed copy is already in the
   * rule. The default check only looks at neighbours with the same unprefixed
   * name, so in
   *
   *   -webkit-mask: ...;
   *   -webkit-mask-composite: ...;
   *   mask: ...;
   *
   * it stops at -webkit-mask-composite and adds a second -webkit-mask.
   * Here mask and mask-composite count as one group.
   */
  isAlready(decl, prefixed) {
    return this.groupHas(decl, prefixed, -1) || this.groupHas(decl, prefixed, 1)
  }

  /**
   * Walk from decl up (direction -1) or down (direction 1) and tell whether
   * the prefixed property comes before the group ends.
   */
  groupHas(decl, prefixed, direction) {
    let nodes = decl.parent.nodes
    for (let i = nodes.indexOf(decl) + direction; nodes[i]; i += direction) {
      let other = nodes[i]
      if (other.type !== 'decl') continue
      if (other.prop === prefixed) return true
      if (this.endsGroup(decl, other)) return false
    }
    return false
  }

  /**
   * The group ends at a property other than mask or mask-composite, at a
   * copy this hack added (it is not the user's own), and at the next
   * unprefixed declaration of the same property, like the default check.
   */
  endsGroup(decl, other) {
    let name = vendor.unprefixed(other.prop)
    if (!MaskComposite.names.includes(name)) return true
    if (other._autoprefixerMaskComposite) return true
    return other.prop === decl.prop && !Browsers.withPrefix(other.value)
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
