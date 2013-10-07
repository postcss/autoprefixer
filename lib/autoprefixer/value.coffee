utils    = require('./utils')
OldValue = require('./old-value')

class Value
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
      new Value(name, prefixes)

  # Cached regexps
  @regexps = { }

  # Generate or get cached regexp
  @regexp = (name) ->
    @regexps[name] ||= utils.regexp(name)

  constructor: (@name, @prefixes) ->
    @regexp = Value.regexp(@name)

  # Is declaration need to be prefixed
  check: (value) ->
    if value.indexOf(@name) != -1
      !!value.match(@regexp)
    else
      false

  # Return function to fast find prefixed value
  old: (prefix) ->
    new OldValue(prefix + @name)

  # Add prefix to values in string
  addPrefix: (prefix, string) ->
    string.replace(@regexp, '$1' + prefix + '$2')

module.exports = Value
