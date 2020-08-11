let vendor = require('./vendor')
let Declaration = require('./declaration')
let Resolution = require('./resolution')
let Transition = require('./transition')
let Processor = require('./processor')
let Supports = require('./supports')
let Browsers = require('./browsers')
let Selector = require('./selector')
let AtRule = require('./at-rule')
let Value = require('./value')
let utils = require('./utils')
Selector.hack(require('./hacks/fullscreen'))
Selector.hack(require('./hacks/placeholder'))
Selector.hack(require('./hacks/placeholder-shown'))
Declaration.hack(require('./hacks/flex'))
Declaration.hack(require('./hacks/order'))
Declaration.hack(require('./hacks/filter'))
Declaration.hack(require('./hacks/grid-end'))
Declaration.hack(require('./hacks/animation'))
Declaration.hack(require('./hacks/flex-flow'))
Declaration.hack(require('./hacks/flex-grow'))
Declaration.hack(require('./hacks/flex-wrap'))
Declaration.hack(require('./hacks/grid-area'))
Declaration.hack(require('./hacks/place-self'))
Declaration.hack(require('./hacks/grid-start'))
Declaration.hack(require('./hacks/align-self'))
Declaration.hack(require('./hacks/appearance'))
Declaration.hack(require('./hacks/flex-basis'))
Declaration.hack(require('./hacks/mask-border'))
Declaration.hack(require('./hacks/mask-composite'))
Declaration.hack(require('./hacks/align-items'))
Declaration.hack(require('./hacks/user-select'))
Declaration.hack(require('./hacks/flex-shrink'))
Declaration.hack(require('./hacks/break-props'))
Declaration.hack(require('./hacks/color-adjust'))
Declaration.hack(require('./hacks/writing-mode'))
Declaration.hack(require('./hacks/border-image'))
Declaration.hack(require('./hacks/align-content'))
Declaration.hack(require('./hacks/border-radius'))
Declaration.hack(require('./hacks/block-logical'))
Declaration.hack(require('./hacks/grid-template'))
Declaration.hack(require('./hacks/inline-logical'))
Declaration.hack(require('./hacks/grid-row-align'))
Declaration.hack(require('./hacks/transform-decl'))
Declaration.hack(require('./hacks/flex-direction'))
Declaration.hack(require('./hacks/image-rendering'))
Declaration.hack(require('./hacks/backdrop-filter'))
Declaration.hack(require('./hacks/background-clip'))
Declaration.hack(require('./hacks/text-decoration'))
Declaration.hack(require('./hacks/justify-content'))
Declaration.hack(require('./hacks/background-size'))
Declaration.hack(require('./hacks/grid-row-column'))
Declaration.hack(require('./hacks/grid-rows-columns'))
Declaration.hack(require('./hacks/grid-column-align'))
Declaration.hack(require('./hacks/overscroll-behavior'))
Declaration.hack(require('./hacks/grid-template-areas'))
Declaration.hack(require('./hacks/text-emphasis-position'))
Declaration.hack(require('./hacks/text-decoration-skip-ink'))
Value.hack(require('./hacks/gradient'))
Value.hack(require('./hacks/intrinsic'))
Value.hack(require('./hacks/pixelated'))
Value.hack(require('./hacks/image-set'))
Value.hack(require('./hacks/cross-fade'))
Value.hack(require('./hacks/display-flex'))
Value.hack(require('./hacks/display-grid'))
Value.hack(require('./hacks/filter-value'))

let declsCache = {}

class Prefixes {
  constructor (data, browsers, options = {}) {
    this.data = data
    this.browsers = browsers
    this.options = options
    ;[this.add, this.remove] = this.preprocess(this.select(this.data))
    this.transition = new Transition(this)
    this.processor = new Processor(this)
  }

  /**
   * Return clone instance to remove all prefixes
   */
  cleaner () {
    if (this.cleanerCache) {
      return this.cleanerCache
    }

    if (this.browsers.selected.length) {
      let empty = new Browsers(this.browsers.data, [])
      this.cleanerCache = new Prefixes(this.data, empty, this.options)
    } else {
      return this
    }

    return this.cleanerCache
  }

  /**
   * Select prefixes from data, which is necessary for selected browsers
   */
  select (list) {
    let selected = { add: {}, remove: {} }

    for (let name in list) {
      let data = list[name]
      let add = data.browsers.map(i => {
        let params = i.split(' ')
        return {
          browser: `${params[0]} ${params[1]}`,
          note: params[2]
        }
      })

      let notes = add
        .filter(i => i.note)
        .map(i => `${this.browsers.prefix(i.browser)} ${i.note}`)
      notes = utils.uniq(notes)

      add = add
        .filter(i => this.browsers.isSelected(i.browser))
        .map(i => {
          let prefix = this.browsers.prefix(i.browser)
          if (i.note) {
            return `${prefix} ${i.note}`
          } else {
            return prefix
          }
        })
      add = this.sort(utils.uniq(add))

      if (this.options.flexbox === 'no-2009') {
        add = add.filter(i => !i.includes('2009'))
      }

      let all = data.browsers.map(i => this.browsers.prefix(i))
      if (data.mistakes) {
        all = all.concat(data.mistakes)
      }
      all = all.concat(notes)
      all = utils.uniq(all)

      if (add.length) {
        selected.add[name] = add
        if (add.length < all.length) {
          selected.remove[name] = all.filter(i => !add.includes(i))
        }
      } else {
        selected.remove[name] = all
      }
    }

    return selected
  }

  /**
   * Sort vendor prefixes
   */
  sort (prefixes) {
    return prefixes.sort((a, b) => {
      let aLength = utils.removeNote(a).length
      let bLength = utils.removeNote(b).length

      if (aLength === bLength) {
        return b.length - a.length
      } else {
        return bLength - aLength
      }
    })
  }

  /**
   * Cache prefixes data to fast CSS processing
   */
  preprocess (selected) {
    let add = {
      'selectors': [],
      '@supports': new Supports(Prefixes, this)
    }
    for (let name in selected.add) {
      let prefixes = selected.add[name]
      if (name === '@keyframes' || name === '@viewport') {
        add[name] = new AtRule(name, prefixes, this)
      } else if (name === '@resolution') {
        add[name] = new Resolution(name, prefixes, this)
      } else if (this.data[name].selector) {
        add.selectors.push(Selector.load(name, prefixes, this))
      } else {
        let props = this.data[name].props

        if (props) {
          let value = Value.load(name, prefixes, this)
          for (let prop of props) {
            if (!add[prop]) {
              add[prop] = { values: [] }
            }
            add[prop].values.push(value)
          }
        } else {
          let values = (add[name] && add[name].values) || []
          add[name] = Declaration.load(name, prefixes, this)
          add[name].values = values
        }
      }
    }

    let remove = { selectors: [] }
    for (let name in selected.remove) {
      let prefixes = selected.remove[name]
      if (this.data[name].selector) {
        let selector = Selector.load(name, prefixes)
        for (let prefix of prefixes) {
          remove.selectors.push(selector.old(prefix))
        }
      } else if (name === '@keyframes' || name === '@viewport') {
        for (let prefix of prefixes) {
          let prefixed = `@${prefix}${name.slice(1)}`
          remove[prefixed] = { remove: true }
        }
      } else if (name === '@resolution') {
        remove[name] = new Resolution(name, prefixes, this)
      } else {
        let props = this.data[name].props
        if (props) {
          let value = Value.load(name, [], this)
          for (let prefix of prefixes) {
            let old = value.old(prefix)
            if (old) {
              for (let prop of props) {
                if (!remove[prop]) {
                  remove[prop] = {}
                }
                if (!remove[prop].values) {
                  remove[prop].values = []
                }
                remove[prop].values.push(old)
              }
            }
          }
        } else {
          for (let p of prefixes) {
            let olds = this.decl(name).old(name, p)
            if (name === 'align-self') {
              let a = add[name] && add[name].prefixes
              if (a) {
                if (p === '-webkit- 2009' && a.includes('-webkit-')) {
                  continue
                } else if (p === '-webkit-' && a.includes('-webkit- 2009')) {
                  continue
                }
              }
            }
            for (let prefixed of olds) {
              if (!remove[prefixed]) {
                remove[prefixed] = {}
              }
              remove[prefixed].remove = true
            }
          }
        }
      }
    }

    return [add, remove]
  }

  /**
   * Declaration loader with caching
   */
  decl (prop) {
    let decl = declsCache[prop]

    if (decl) {
      return decl
    } else {
      declsCache[prop] = Declaration.load(prop)
      return declsCache[prop]
    }
  }

  /**
   * Return unprefixed version of property
   */
  unprefixed (prop) {
    let value = this.normalize(vendor.unprefixed(prop))
    if (value === 'flex-direction') {
      value = 'flex-flow'
    }
    return value
  }

  /**
   * Normalize prefix for remover
   */
  normalize (prop) {
    return this.decl(prop).normalize(prop)
  }

  /**
   * Return prefixed version of property
   */
  prefixed (prop, prefix) {
    prop = vendor.unprefixed(prop)
    return this.decl(prop).prefixed(prop, prefix)
  }

  /**
   * Return values, which must be prefixed in selected property
   */
  values (type, prop) {
    let data = this[type]

    let global = data['*'] && data['*'].values
    let values = data[prop] && data[prop].values

    if (global && values) {
      return utils.uniq(global.concat(values))
    } else {
      return global || values || []
    }
  }

  /**
   * Group declaration by unprefixed property to check them
   */
  group (decl) {
    let rule = decl.parent
    let index = rule.index(decl)
    let { length } = rule.nodes
    let unprefixed = this.unprefixed(decl.prop)

    let checker = (step, callback) => {
      index += step
      while (index >= 0 && index < length) {
        let other = rule.nodes[index]
        if (other.type === 'decl') {
          if (step === -1 && other.prop === unprefixed) {
            if (!Browsers.withPrefix(other.value)) {
              break
            }
          }

          if (this.unprefixed(other.prop) !== unprefixed) {
            break
          } else if (callback(other) === true) {
            return true
          }

          if (step === +1 && other.prop === unprefixed) {
            if (!Browsers.withPrefix(other.value)) {
              break
            }
          }
        }

        index += step
      }
      return false
    }

    return {
      up (callback) {
        return checker(-1, callback)
      },
      down (callback) {
        return checker(+1, callback)
      }
    }
  }
}

module.exports = Prefixes
