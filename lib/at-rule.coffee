Prefixer = require('./prefixer')

class AtRule extends Prefixer

  # Clone and add prefixes for at-rule
  add: (rule, prefix) ->
    prefixed = prefix + rule.name

    already = rule.parent.some (i) ->
      i.name == prefixed and i.params == rule.params
    return if already

    cloned = @clone(rule, name: prefixed)
    rule.parent.insertBefore(rule, cloned)

  # Clone node with prefixes
  process: (node) ->
    parent = @parentPrefix(node)

    for prefix in @prefixes
      continue if parent and parent != prefix
      @add(node, prefix)

module.exports = AtRule
