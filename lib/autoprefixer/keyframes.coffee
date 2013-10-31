Prefixer = require('./prefixer')

class Keyframes extends Prefixer

  # Prefix only @keyframes
  check: (atRule) ->
    atRule.name == 'keyframes'

  # Clone and add prefixes for at-rule
  add: (atRule, prefix) ->
    prefixed = prefix + atRule.name

    already = atRule.parent.some (i) ->
      i.name == prefixed and i.params == atRule.params
    return if already

    clone = atRule.clone(name: prefixed)
    atRule.parent.insertBefore(atRule, clone)

module.exports = Keyframes
