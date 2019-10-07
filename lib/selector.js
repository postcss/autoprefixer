let OldSelector = require('./old-selector')
let Prefixer = require('./prefixer')
let Browsers = require('./browsers')
let utils = require('./utils')

const SELECTORS_CACHE = {}

class Selector extends Prefixer {
  constructor (name, prefixes, all) {
    super(name, prefixes, all)
    this.regexpCache = {}
    SELECTORS_CACHE[name] = {
      possible: this.possible(),
      replace: this.replace.bind(this)
    }
  }

  /**
     * Is rule selectors need to be prefixed
     */
  check (rule) {
    if (rule.selector.includes(this.name)) {
      return !!rule.selector.match(this.regexp())
    }

    return false
  }

  /**
     * Return prefixed version of selector
     */
  prefixed (prefix) {
    return this.name.replace(/^([^\w]*)/, `$1${ prefix }`)
  }

  /**
     * Lazy loadRegExp for name
     */
  regexp (prefix) {
    if (this.regexpCache[prefix]) {
      return this.regexpCache[prefix]
    }

    let name = prefix ? this.prefixed(prefix) : this.name
    this.regexpCache[prefix] =
            new RegExp(`(^|[^:"'=])${ utils.escapeRegexp(name) }`, 'gi')
    return this.regexpCache[prefix]
  }

  /**
     * All possible prefixes
     */
  possible () {
    return Browsers.prefixes()
  }

  /**
     * Return all possible selector prefixes
     */
  prefixeds (rule) {
    if (rule._autoprefixerPrefixeds) {
      return rule._autoprefixerPrefixeds
    }

    let prefixeds = {}

    if (rule.selector.includes(',')) {
      let toProcess = rule.selector
        .split(',')
        .filter(el => el.includes(':'))
        .map(el => el.trim())

      Object.keys(SELECTORS_CACHE).forEach(name => {
        let selector = toProcess.find(el => el.includes(name))
        if (selector) {
          prefixeds[name] = {}
          SELECTORS_CACHE[name].possible.forEach(prefix => {
            prefixeds[name][prefix] = SELECTORS_CACHE[name].replace(
              selector, prefix)
          })
        }
      })
    } else {
      prefixeds[this.name] = {}

      for (let prefix of this.possible()) {
        prefixeds[this.name][prefix] = this.replace(rule.selector, prefix)
      }
    }

    rule._autoprefixerPrefixeds = prefixeds
    return rule._autoprefixerPrefixeds
  }

  /**
     * Is rule already prefixed before
     */
  already (rule, prefixeds, prefix) {
    let index = rule.parent.index(rule) - 1

    while (index >= 0) {
      let before = rule.parent.nodes[index]

      if (before.type !== 'rule') {
        return false
      }

      let some = false
      for (let key in prefixeds[this.name]) {
        let prefixed = prefixeds[this.name][key]
        if (before.selector === prefixed) {
          if (prefix === key) {
            return true
          } else {
            some = true
            break
          }
        }
      }
      if (!some) {
        return false
      }

      index -= 1
    }

    return false
  }

  /**
     * Replace selectors by prefixed one
     */
  replace (selector, prefix) {
    return selector.replace(this.regexp(), `$1${ this.prefixed(prefix) }`)
  }

  /**
     * Clone and add prefixes for at-rule
     */
  add (rule, prefix) {
    let prefixeds = this.prefixeds(rule)

    if (this.already(rule, prefixeds, prefix)) {
      return
    }

    let cloned = this.clone(rule, { selector: prefixeds[this.name][prefix] })
    rule.parent.insertBefore(rule, cloned)
  }

  /**
     * Return function to fast find prefixed selector
     */
  old (prefix) {
    return new OldSelector(this, prefix)
  }
}

module.exports = Selector
