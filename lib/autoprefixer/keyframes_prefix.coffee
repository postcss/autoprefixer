Prefix = require('./prefix')

class KeyframesPrefix extends Prefix

  # Clone and add prefixes for at-rule
  addPrefix: (atRule, prefix) ->
    prefixed = prefix + atRule.name

    already = atRule.parent.some (i) ->
      i.name == prefixed and i.params == atRule.params
    return if already

    clone = atRule.clone(name: prefixed)
    atRule.parent.insertBefore(atRule, clone)

module.exports = KeyframesPrefix
