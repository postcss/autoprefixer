Prefixer = require('./prefixer')
utils    = require('./utils')

class Selector extends Prefixer
  constructor: (@name, @prefixes, @all) ->
    @regexpCache = { }

  # Is rule selectors need to be prefixed
  check: (rule, prefix) ->
    name = if prefix then @prefixed(prefix) else @name
    if rule.selector.indexOf(name) != -1
      !!rule.selector.match(@regexp(prefix))
    else
      false

  # Return function to find prefixed selector
  checker: (prefix) ->
    (rule) => @check(rule, prefix)

  # Return prefixed version of selector
  prefixed: (prefix) ->
    @name.replace(/^([^\w]*)/, '$1' + prefix)

  # Lazy loadRegExp for name
  regexp: (prefix) ->
    return @regexpCache[prefix] if @regexpCache[prefix]

    name = if prefix then @prefixed(prefix) else @name
    @regexpCache = /// (^|[^:"'=]) #{ utils.escapeRegexp(name) } ///gi

  # Replace selectors by prefixed one
  replace: (selector, prefix) ->
    selector.replace(@regexp(), '$1' + @prefixed(prefix))

  # Clone and add prefixes for at-rule
  add: (rule, prefix) ->
    prefixed = @replace(rule.selector, prefix)

    return if rule.parent.some (i) -> i.selector == prefixed

    cloned = @clone(rule, selector: prefixed)
    rule.parent.insertBefore(rule, cloned)

module.exports = Selector
