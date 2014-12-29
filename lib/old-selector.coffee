class OldSelector
  constructor: (selector, @prefix) ->
    @prefixed = selector.prefixed(@prefix)
    @regexp   = selector.regexp(@prefix)

    @prefixeds = []
    for prefix in selector.possible()
      @prefixeds.push [selector.prefixed(prefix), selector.regexp(prefix)]

    @unprefixed = selector.name
    @nameRegexp = selector.regexp()

  # Is rule is hack without unprefixed version bottom
  isHack: (rule) ->
    index = rule.parent.index(rule) + 1
    rules = rule.parent.nodes

    while index < rules.length
      before = rules[index].selector
      return true unless before

      if before.indexOf(@unprefixed) != -1 and before.match(@nameRegexp)
        return false

      some = false
      for [string, regexp] in @prefixeds
        if before.indexOf(string) != -1 and before.match(regexp)
          some = true
          break

      return true unless some

      index += 1

    true

  # Does rule contain unnecessayr prefixed selector
  check: (rule) ->
    return false if  rule.selector.indexOf(@prefixed) == -1
    return false if !rule.selector.match(@regexp)
    return false if  @isHack(rule)
    true

module.exports = OldSelector
