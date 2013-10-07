utils = require('./utils')

class Keyframes
  constructor: (@css, @number, @rule) ->
    @prefix = @rule.vendor

  # Clone current @keyframes
  clone: ->
    utils.clone @rule,
      keyframes: @rule.keyframes.map (i) ->
        if i.type == 'keyframe'
          utils.clone i,
            values:       i.values.slice()
            declarations: i.declarations.map (decl) -> utils.clone(decl)
        else
          utils.clone i

  # Clone keyframes, add prefix and insert before current one
  cloneWithPrefix: (prefix) ->
    clone = @clone()
    clone.vendor = prefix
    @css.addKeyframes(@number, clone)
    @number += 1

  # Remove current keyframes
  remove: ->
    @css.removeKeyframes(@number)

module.exports = Keyframes
