utils = require('./utils')

class Selector
  # Add hack to selected names
  @register: (klass) ->
    for name in klass.names
      @hacks[name] = klass

  # Override classes for special values
  @hacks: { }

  # Detect right class by value name and create it instance
  @load: (name, prefixes) ->
    klass = @hacks[name]
    if klass
      new klass(name, prefixes)
    else
      new Selector(name, prefixes)

  constructor: (@name, @prefixes = []) ->
    @prefixes = @prefixes.sort (a, b) -> a.length - b.length

  # Is rule selectors need to be prefixed
  check: (selectors) ->
    selectors.indexOf(@name) != -1

  # Return prefixed version of selector
  prefixed: (prefix) ->
    @name.replace(/^([^\w]*)/, '$1' + prefix)

  # Lazy loadRegExp for name
  regexp: ->
    @regexpCache ||= new RegExp(utils.escapeRegexp(@name), 'gi')

  # Replace selectors by prefixed one
  replace: (selectors, prefix) ->
    selectors.replace(@regexp(), @prefixed(prefix))

module.exports = Selector
