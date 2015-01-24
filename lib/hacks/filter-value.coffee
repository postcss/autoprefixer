OldValue = require('../old-value')
Value    = require('../value')
utils    = require('../utils')

class FilterValue extends Value
  @names = ['filter']

  # Use prefixed and unprefixed filter for WebKit transition
  replace: (value, prefix) ->
    if prefix == '-webkit-'
      if value.indexOf('-webkit-filter') == -1
        super + ', ' + value
      else
        value
    else
      super

  # Clean -webkit-filter from transitioins
  old: (prefix) ->
    old = new OldValue(prefix + @name)

    if prefix == '-webkit-'
      old.clean = (decl) ->
        decl.value = utils.editList decl.value, (props, cleaned) ->
          for prop in props
            cleaned.push(prop) if prop.indexOf('-webkit-filter') == -1
          cleaned

    old

module.exports = FilterValue
