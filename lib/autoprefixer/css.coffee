Rules       = require('./rules')
Keyframes   = require('./keyframes')
Declaration = require('./declaration')

class CSS
  constructor: (@stylesheet) ->

  # Execute callback on every keyframes
  eachKeyframes: (callback) ->
    @number = 0
    while @number < @stylesheet.rules.length
      rule = @stylesheet.rules[@number]
      if rule.keyframes
        callback(new Keyframes(@, @number, rule))
      @number += 1
    false

  # Is CSS contain keyframes with this name and prefix
  containKeyframes: (rule) ->
    @stylesheet.rules.some (i) ->
      i.keyframes and i.name == rule.name and i.vendor == rule.vendor

  # Add keyframes on selected position
  addKeyframes: (position, rule) ->
    return if @containKeyframes(rule)
    @stylesheet.rules.splice(position, 0, rule)
    @number += 1

  # Remove keyframes, where callback return true
  removeKeyframes: (position) ->
    @stylesheet.rules.splice(position, 1)
    @number -= 1

  # Execute callback on every rule
  eachRule: (callback) ->
    Rules.each(@stylesheet.rules, callback)

  # Execute callback on every property: value declaration in CSS tree
  eachDeclaration: (callback) ->
    @eachRule (rule) -> rule.each(callback)

module.exports = CSS
