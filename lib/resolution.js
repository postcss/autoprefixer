let FractionJs = require('fraction.js')

let Prefixer = require('./prefixer')
let utils = require('./utils')

const REGEXP = /(min|max)-resolution\s*:\s*\d*\.?\d+(dppx|dpcm|dpi|x)/gi
const SPLIT = /((min|max)-resolution)(\s*:\s*)(\d*\.?\d+)(dppx|dpcm|dpi|x)/i

class Resolution extends Prefixer {
  /**
   * Return prefixed query name
   */
  prefixName(prefix, name) {
    if (prefix === '-moz-') {
      return name + '--moz-device-pixel-ratio'
    } else {
      return prefix + name + '-device-pixel-ratio'
    }
  }

  /**
   * Return prefixed query
   */
  prefixQuery(prefix, name, colon, value, units) {
    value = new FractionJs(value)

    // 1dpcm = 2.54dpi
    // 1dppx = 96dpi
    if (units === 'dpi') {
      value = value.div(96)
    } else if (units === 'dpcm') {
      value = value.mul(2.54).div(96)
    }
    value = value.simplify()

    if (prefix === '-o-') {
      value = value.n + '/' + value.d
    }
    return this.prefixName(prefix, name) + colon + value
  }

  /**
   * Remove prefixed queries
   */
  clean(rule) {
    if (!this.bad) {
      this.bad = []
      for (let prefix of this.prefixes) {
        this.bad.push(this.prefixName(prefix, 'min'))
        this.bad.push(this.prefixName(prefix, 'max'))
      }
    }

    rule.params = utils.editList(rule.params, queries => {
      return queries.filter(query => this.bad.every(i => !query.includes(i)))
    })
  }

  /**
   * Add prefixed queries
   */
  process(rule) {
    let parent = this.parentPrefix(rule)
    let prefixes = parent ? [parent] : this.prefixes

    rule.params = utils.editList(rule.params, (origin, prefixed) => {
      for (let query of origin) {
        if (
          !query.includes('min-resolution') &&
          !query.includes('max-resolution')
        ) {
          prefixed.push(query)
          continue
        }

        let fallbackExpression
        let addFallbackExpression = false
        for (let prefix of prefixes) {
          let processed = query.replace(REGEXP, str => {
            let parts = str.match(SPLIT)
            let fallbackName = parts[1]
            let colon = parts[3]
            let value = parts[4]
            let units = parts[5]

            // Add `ddpx` for browsers that do not support `x` unit.
            // `x` unit: Chrome 68+, Edge 79+, Opera 55+, Safari 16+, Firefox 62+
            // See: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution#browser_compatibility
            if (units === 'x') {
              fallbackExpression = '(' + fallbackName + colon + value + 'dppx' + ')'
              addFallbackExpression = true
            }

            return this.prefixQuery(
              prefix,
              parts[2], // min- or max-
              colon,
              value,
              units
            )
          })
          prefixed.push(processed)
        }

        if (addFallbackExpression) prefixed.push(fallbackExpression)
        prefixed.push(query)
      }

      return utils.uniq(prefixed)
    })
  }
}

module.exports = Resolution
