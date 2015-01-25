OldValue = require('../old-value')
Value    = require('../value')
utils    = require('../utils')

class OldFilterValue extends OldValue

  # Clean -webkit-filter from properties list
  clean: (decl, notHack) ->
    if notHack
      decl.removeSelf()
    else
      decl.value = utils.editList decl.value, (props) =>
        return props if props.every( (i) => i.indexOf(@unprefixed) != 0 )
        props.filter (i) => i.indexOf(@prefixed) == -1

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
    new OldFilterValue(@name, prefix + @name)

module.exports = FilterValue
