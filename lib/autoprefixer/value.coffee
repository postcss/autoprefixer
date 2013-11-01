Prefixer = require('./prefixer')
OldValue = require('./old-value')
utils    = require('./utils')

class Value extends Prefixer

  # Clone decl for each prefixed values
  @save: (decl) ->
    for prefix, value of decl._autoprefixerValues
      prefix = utils.removeNote(prefix)
      if decl.prefix == prefix
        decl.value = value
      else if decl.parent.every( (i) -> i.prop != prefix + decl.unprefixed )
        cloned = @clone(decl, value: value)
        decl.parent.insertBefore(decl, cloned)

  # Is declaration need to be prefixed
  check: (decl) ->
    value = decl.value
    if value.indexOf(@name) != -1
      !!value.match(@regexp())
    else
      false

  # Lazy regexp loading
  regexp: ->
    @regexpCache ||= utils.regexp(@name)

  # Add prefix to values in string
  replace: (string, prefix) ->
    string.replace(@regexp(), '$1' + prefix + '$2')

  # Save values with next prefixed token
  add: (decl, prefix) ->
    decl._autoprefixerValues ||= { }
    value = decl._autoprefixerValues[prefix] || decl.value
    decl._autoprefixerValues[prefix] = @replace(value, prefix)

  # Return function to fast find prefixed value
  old: (prefix) ->
    new OldValue(prefix + @name)

module.exports = Value
