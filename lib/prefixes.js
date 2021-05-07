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
const hackFullscreen = require('./hacks/fullscreen')
const hackPlaceholder = require('./hacks/placeholder')
const hackPlaceholderShown = require('./hacks/placeholder-shown')
const hackFlex = require('./hacks/flex')
const hackOrder = require('./hacks/order')
const hackFilter = require('./hacks/filter')
const hackGridEnd = require('./hacks/grid-end')
const hackAnimation = require('./hacks/animation')
const hackFlexFlow = require('./hacks/flex-flow')
const hackFlexGrow = require('./hacks/flex-grow')
const hackFlexWrap = require('./hacks/flex-wrap')
const hackGridArea = require('./hacks/grid-area')
const hackPlaceSelf = require('./hacks/place-self')
const hackGridStart = require('./hacks/grid-start')
const hackAlignSelf = require('./hacks/align-self')
const hackAppearance = require('./hacks/appearance')
const hackFlexBasis = require('./hacks/flex-basis')
const hackMaskBorder = require('./hacks/mask-border')
const hackMaskComposite = require('./hacks/mask-composite')
const hackAlignItems = require('./hacks/align-items')
const hackUserSelect = require('./hacks/user-select')
const hackFlexShrink = require('./hacks/flex-shrink')
const hackBreakProps = require('./hacks/break-props')
const hackColorAdjust = require('./hacks/color-adjust')
const hackWritingMode = require('./hacks/writing-mode')
const hackBorderImage = require('./hacks/border-image')
const hackAlignContent = require('./hacks/align-content')
const hackBorderRadius = require('./hacks/border-radius')
const hackBlockLogical = require('./hacks/block-logical')
const hackGridTemplate = require('./hacks/grid-template')
const hackInlineLogical = require('./hacks/inline-logical')
const hackGridRowAlign = require('./hacks/grid-row-align')
const hackTransformDecl = require('./hacks/transform-decl')
const hackFlexDirection = require('./hacks/flex-direction')
const hackImageRendering = require('./hacks/image-rendering')
const hackBackdropFilter = require('./hacks/backdrop-filter')
const hackBackgroundClip = require('./hacks/background-clip')
const hackTextDecoration = require('./hacks/text-decoration')
const hackJustifyContent = require('./hacks/justify-content')
const hackBackgroundSize = require('./hacks/background-size')
const hackGridRowColumn = require('./hacks/grid-row-column')
const hackGridRowsColumns = require('./hacks/grid-rows-columns')
const hackGridColumnAlign = require('./hacks/grid-column-align')
const hackOverscrollBehavior = require('./hacks/overscroll-behavior')
const hackGridTemplateAreas = require('./hacks/grid-template-areas')
const hackTextEmphasisPosition = require('./hacks/text-emphasis-position')
const hackTextDecorationSkipInk = require('./hacks/text-decoration-skip-ink')
const hackGradient = require('./hacks/gradient')
const hackIntrinsic = require('./hacks/intrinsic')
const hackPixelated = require('./hacks/pixelated')
const hackImageSet = require('./hacks/image-set')
const hackCrossFade = require('./hacks/cross-fade')
const hackDisplayFlex = require('./hacks/display-flex')
const hackDisplayGrid = require('./hacks/display-grid')
const hackFilterValue = require('./hacks/filter-value')

Selector.hack(hackFullscreen)
Selector.hack(hackPlaceholder)
Selector.hack(hackPlaceholderShown)
Declaration.hack(hackFlex)
Declaration.hack(hackOrder)
Declaration.hack(hackFilter)
Declaration.hack(hackGridEnd)
Declaration.hack(hackAnimation)
Declaration.hack(hackFlexFlow)
Declaration.hack(hackFlexGrow)
Declaration.hack(hackFlexWrap)
Declaration.hack(hackGridArea)
Declaration.hack(hackPlaceSelf)
Declaration.hack(hackGridStart)
Declaration.hack(hackAlignSelf)
Declaration.hack(hackAppearance)
Declaration.hack(hackFlexBasis)
Declaration.hack(hackMaskBorder)
Declaration.hack(hackMaskComposite)
Declaration.hack(hackAlignItems)
Declaration.hack(hackUserSelect)
Declaration.hack(hackFlexShrink)
Declaration.hack(hackBreakProps)
Declaration.hack(hackColorAdjust)
Declaration.hack(hackWritingMode)
Declaration.hack(hackBorderImage)
Declaration.hack(hackAlignContent)
Declaration.hack(hackBorderRadius)
Declaration.hack(hackBlockLogical)
Declaration.hack(hackGridTemplate)
Declaration.hack(hackInlineLogical)
Declaration.hack(hackGridRowAlign)
Declaration.hack(hackTransformDecl)
Declaration.hack(hackFlexDirection)
Declaration.hack(hackImageRendering)
Declaration.hack(hackBackdropFilter)
Declaration.hack(hackBackgroundClip)
Declaration.hack(hackTextDecoration)
Declaration.hack(hackJustifyContent)
Declaration.hack(hackBackgroundSize)
Declaration.hack(hackGridRowColumn)
Declaration.hack(hackGridRowsColumns)
Declaration.hack(hackGridColumnAlign)
Declaration.hack(hackOverscrollBehavior)
Declaration.hack(hackGridTemplateAreas)
Declaration.hack(hackTextEmphasisPosition)
Declaration.hack(hackTextDecorationSkipInk)
Value.hack(hackGradient)
Value.hack(hackIntrinsic)
Value.hack(hackPixelated)
Value.hack(hackImageSet)
Value.hack(hackCrossFade)
Value.hack(hackDisplayFlex)
Value.hack(hackDisplayGrid)
Value.hack(hackFilterValue)

let declsCache = new Map()

class Prefixes {
  constructor(data, browsers, options = {}) {
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
  cleaner() {
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
  select(list) {
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
  sort(prefixes) {
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
  preprocess(selected) {
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
  decl(prop) {
    if (!declsCache.has(prop)) {
      declsCache.set(prop, Declaration.load(prop))
    }

    return declsCache.get(prop)
  }

  /**
   * Return unprefixed version of property
   */
  unprefixed(prop) {
    let value = this.normalize(vendor.unprefixed(prop))
    if (value === 'flex-direction') {
      value = 'flex-flow'
    }
    return value
  }

  /**
   * Normalize prefix for remover
   */
  normalize(prop) {
    return this.decl(prop).normalize(prop)
  }

  /**
   * Return prefixed version of property
   */
  prefixed(prop, prefix) {
    prop = vendor.unprefixed(prop)
    return this.decl(prop).prefixed(prop, prefix)
  }

  /**
   * Return values, which must be prefixed in selected property
   */
  values(type, prop) {
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
  group(decl) {
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
      up(callback) {
        return checker(-1, callback)
      },
      down(callback) {
        return checker(+1, callback)
      }
    }
  }
}

module.exports = Prefixes
