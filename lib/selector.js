let { list } = require('postcss')

let Browsers = require('./browsers')
let OldSelector = require('./old-selector')
let Prefixer = require('./prefixer')
let utils = require('./utils')

// Old pseudos that every browser knows, so a selector with only them is safe
// to keep next to a prefixed one
const SAFE_PSEUDOS = new Set([
  'active',
  'after',
  'before',
  'first-child',
  'first-letter',
  'first-line',
  'focus',
  'hover',
  'link',
  'visited'
])

class Selector extends Prefixer {
  constructor(name, prefixes, all) {
    super(name, prefixes, all)
    this.regexpCache = new Map()
    this.nameRegexp = new RegExp(utils.escapeRegexp(name), 'i')
  }

  /**
   * Clone and add prefixes for at-rule
   */
  add(rule, prefix) {
    let prefixeds = this.prefixeds(rule)

    if (this.already(rule, prefixeds, prefix)) {
      return
    }

    let cloned = this.clone(rule, { selector: prefixeds[this.name][prefix] })
    rule.parent.insertBefore(rule, cloned)
  }

  /**
   * Is rule already prefixed before
   */
  already(rule, prefixeds, prefix) {
    let index = rule.parent.index(rule) - 1

    // Other selectors in the same rule put their copies before it too
    let others = []
    if (this.all) {
      for (let selector of this.all.add.selectors) {
        if (selector !== this && selector.check(rule)) {
          let variants = selector.prefixeds(rule)[selector.name]
          others.push(...Object.values(variants))
        }
      }
    }

    while (index >= 0) {
      let before = rule.parent.nodes[index]

      if (before.type !== 'rule') {
        return false
      }

      let beforeSelector = list.comma(before.selector).join(', ')

      let some = false
      for (let key in prefixeds[this.name]) {
        let prefixed = prefixeds[this.name][key]
        if (beforeSelector === prefixed) {
          if (prefix === key) {
            return true
          } else {
            some = true
            break
          }
        }
      }
      if (!some && !others.includes(beforeSelector)) {
        return false
      }

      index -= 1
    }

    return false
  }

  /**
   * Can selector without this pseudo stay in the prefixed rule.
   * Browser ignores the whole rule if it does not know any selector in it,
   * and we have no data on most pseudos, so only selectors without pseudos
   * or with old CSS2 pseudos stay. Attribute flags like `[a=b i]` are new too.
   */
  canStay(selector) {
    let quote = false
    let brackets = 0
    let start = 0
    for (let i = 0; i < selector.length; i++) {
      let char = selector[i]
      if (char === '\\') {
        i++
      } else if (quote) {
        if (char === quote) quote = false
      } else if (char === '"' || char === "'") {
        quote = char
      } else if (char === '[') {
        if (brackets === 0) start = i + 1
        brackets++
      } else if (char === ']') {
        brackets--
        let attr = selector.slice(start, i)
        if (brackets === 0 && /=.*(\s|["'])[is]\s*$/is.test(attr)) {
          return false
        }
      } else if (char === ':' && brackets === 0) {
        if (selector[i + 1] === ':') i++
        let name = /^[\w-]*/.exec(selector.slice(i + 1))[0]
        if (!SAFE_PSEUDOS.has(name.toLowerCase())) return false
        i += name.length
      }
    }
    return true
  }

  /**
   * Is rule selectors need to be prefixed
   */
  check(rule) {
    if (this.nameRegexp.test(rule.selector)) {
      return !!rule.selector.match(this.regexp())
    }

    return false
  }

  /**
   * Return function to fast find prefixed selector
   */
  old(prefix) {
    return new OldSelector(this, prefix)
  }

  /**
   * All possible prefixes
   */
  possible() {
    return Browsers.prefixes()
  }

  /**
   * Return prefixed version of selector
   */
  prefixed(prefix) {
    return this.name.replace(/^(\W*)/, `$1${prefix}`)
  }

  /**
   * Return all possible selector prefixes
   */
  prefixeds(rule) {
    if (rule._autoprefixerPrefixeds) {
      if (rule._autoprefixerPrefixeds[this.name]) {
        return rule._autoprefixerPrefixeds
      }
    } else {
      rule._autoprefixerPrefixeds = {}
    }

    let prefixeds = {}
    if (rule.selector.includes(',')) {
      let ruleParts = list.comma(rule.selector)

      for (let prefix of this.possible()) {
        let parts = []
        for (let el of ruleParts) {
          if (this.nameRegexp.test(el)) {
            parts.push(this.replace(el, prefix))
          } else if (this.canStay(el)) {
            parts.push(el)
          }
        }
        prefixeds[prefix] = parts.join(', ')
      }
    } else {
      for (let prefix of this.possible()) {
        prefixeds[prefix] = this.replace(rule.selector, prefix)
      }
    }

    rule._autoprefixerPrefixeds[this.name] = prefixeds
    return rule._autoprefixerPrefixeds
  }

  /**
   * Lazy loadRegExp for name
   */
  regexp(prefix) {
    if (!this.regexpCache.has(prefix)) {
      let name = prefix ? this.prefixed(prefix) : this.name
      this.regexpCache.set(
        prefix,
        new RegExp(`(^|[^:"'=])${utils.escapeRegexp(name)}`, 'gi')
      )
    }

    return this.regexpCache.get(prefix)
  }

  /**
   * Replace selectors by prefixed one
   */
  replace(selector, prefix) {
    return selector.replace(this.regexp(), `$1${this.prefixed(prefix)}`)
  }
}

module.exports = Selector
