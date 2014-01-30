OldValue = require('../old-value')
Value    = require('../value')

class Transition extends Value
  @names = ['flex', 'flex-grow', 'flex-shrink', 'flex-basis']

  # Return prefixed property name
  prefixed: (prefix) ->
    @all.prefixed(@name, prefix)

  # Change property name to prefixed property name
  replace: (string, prefix) ->
    string.replace(@regexp(), '$1' + @prefixed(prefix) + '$3')

  # Return function to fast prefixed property name
  old: (prefix) ->
    new OldValue(@prefixed(prefix))

module.exports = Transition
