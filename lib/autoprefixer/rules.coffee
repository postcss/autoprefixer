Rule = require('./rule')

class Rules

  # Shortcut to create Rules instance and run each
  @each: (list, callback) ->
    rules = new Rules(list)
    rules.each(callback)

  constructor: (@list) ->

  # Execute callback on every rule
  each: (callback) ->
    @number = 0
    while @number < @list.length
      i = @list[@number]

      Rules.each(i.rules, callback) if i.rules

      if i.keyframes
        for keyframe in i.keyframes
          if keyframe.type == 'keyframe'
            rule = new Rule(@, @number, keyframe, i.vendor)
            callback(rule)

      if i.declarations
        rule = new Rule(@, @number, i, i.vendor)
        callback(rule)

      @number += 1
    false

  # Is rules list contain rule with this selector
  contain: (selector) ->
    for i in @list
      continue unless i.selectors
      return true if i.selectors.join(', ') == selector
    false

  # Add new rule at selected position
  add: (position, rule) ->
    @list.splice(position, 0, rule)
    @number += 1

  # Remove rule in selected position
  remove: (position) ->
    @list.splice(position, 1)
    @number -= 1

module.exports = Rules
