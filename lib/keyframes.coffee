Prefixer = require('./prefixer')

class Keyframes extends Prefixer

  # Clone and add prefixes for at-rule
  add: (atRule, prefix) ->
    prefixed = prefix + atRule.name

    already = atRule.parent.some (i) ->
      i.name == prefixed and i.params == atRule.params
    return if already

    cloned = @clone(atRule, name: prefixed)
    atRule.parent.insertBefore(atRule, cloned)

  # Clone node with prefixes
  process: (node) ->
    parent = @parentPrefix(node)

    for prefix in @prefixes
      continue if parent and parent != prefix
      @add(node, prefix)

module.exports = Keyframes
