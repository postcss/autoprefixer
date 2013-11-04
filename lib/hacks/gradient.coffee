OldValue = require('../old-value')
Value    = require('../value')
utils    = require('../utils')
list     = require('postcss/lib/list')

isDirection = new RegExp('(top|left|right|bottom)', 'gi')

class Gradient extends Value
  @names = ['linear-gradient', 'repeating-linear-gradient',
            'radial-gradient', 'repeating-radial-gradient']

  # Smarter regexp for gradients
  regexp: ->
    @regexpCache ||= new RegExp('(^|\\s|,)' + @name + '\\((.+)\\)', 'gi')

  # Change degrees for webkit prefix
  replace: (string, prefix) ->
    values = list.comma(string).map (value) =>
      value.replace @regexp(), (all, before, args) =>
        params = list.comma(args)
        params = @newDirection(params)

        if prefix == '-webkit- old'
          return all if @name != 'linear-gradient'
          return all if params[0] and params[0].indexOf('deg') != -1
          return all if args.indexOf('-corner') != -1
          return all if args.indexOf('-side')   != -1

          params = @oldDirection(params)
          params = @colorStops(params)

          '-webkit-gradient(linear, ' + params.join(', ') + ')'
        else
          if params.length > 0
            if params[0][0..2] == 'to '
              params[0] = @fixDirection(params[0])
            else if params[0].indexOf('deg') != -1
              params[0] = @fixAngle(params[0])
            else if params[0].indexOf(' at ') != -1
              @fixRadial(params)
          before + prefix + @name + '(' + params.join(', ') + ')'

    values.join(', ')

  # Direction to replace
  directions:
    top:    'bottom'
    left:   'right'
    bottom: 'top'
    right:  'left'

  # Direction to replace
  oldDirections:
    'top':    'left bottom, left top'
    'left':   'right top, left top'
    'bottom': 'left top, left bottom'
    'right':  'left top, right top'

    'top right':    'left bottom, right top'
    'top left':     'right bottom, left top'
    'bottom right': 'left top, right bottom'
    'bottom left':  'right top, left bottom'

  # Replace old direction to new
  newDirection: (params) ->
    first = params[0]

    if first.indexOf('to ') == -1 and isDirection.test(first)
      first = first.split(' ')
      first = for value in first
        @directions[value.toLowerCase()] || value
      params[0] = 'to ' + first.join(' ')

    params

  # Replace `to top left` to `bottom right`
  fixDirection: (param) ->
    param = param.split(' ')
    param.splice(0, 1)
    param = for value in param
      @directions[value.toLowerCase()] || value
    param.join(' ')

  # Round float and save digits under dot
  roundFloat: (float, digits) ->
    parseFloat(float.toFixed(digits))

  # Add 90 degrees
  fixAngle: (param) ->
    param = parseFloat(param)
    param = Math.abs(450 - param) % 360
    param = @roundFloat(param, 3)
    "#{param}deg"

  # Fix radial direction syntax
  fixRadial: (params) ->
    first = params[0].split(/\s+at\s+/)
    params.splice(0, 1, first[1], first[0])

  oldDirection: (params) ->
    params if params.length == 0

    if params[0].indexOf('to ') != -1
      direction = params[0].replace(/^to\s+/, '')
      direction = @oldDirections[direction]
      params[0] = direction
      params
    else
      direction = @oldDirections.bottom
      [direction].concat(params)

  # Change colors syntax to old webkit
  colorStops: (params) ->
    params.map (param, i) ->
      return param if i == 0

      separator = param.lastIndexOf(' ')
      if separator == -1
        color    = param
        position = undefined
      else
        color     = param[0...separator]
        position  = param[(separator + 1)..-1]

      if position and position.indexOf(')') != -1
        color   += ' ' + position
        position = undefined

      if i == 1
        "from(#{color})"
      else if i == params.length - 1
        "to(#{color})"
      else if position
        "color-stop(#{position}, #{color})"
      else
        "color-stop(#{color})"

  # Remove old WebKit gradient too
  old: (prefix) ->
    if prefix == '-webkit-'
      type   = if @name == 'linear-gradient' then 'linear' else 'radial'
      string = '-gradient'
      regexp = utils.regexp(
        "-webkit-(#{type}-gradient|gradient\\(\\s*#{type})", false)

      new OldValue(prefix + @name, string, regexp)
    else
      super

module.exports = Gradient
