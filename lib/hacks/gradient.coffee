OldValue = require('../old-value')
Value    = require('../value')
utils    = require('../utils')
list     = require('postcss/lib/list')

isDirection = /top|left|right|bottom/gi

class Gradient extends Value
  @names = ['linear-gradient', 'repeating-linear-gradient',
            'radial-gradient', 'repeating-radial-gradient']

  # Change degrees for webkit prefix
  replace: (string, prefix) ->
    list.space(string)
      .map (value) =>
        return value if value[0..@name.length] != @name + '('

        close  = value.lastIndexOf(')')
        after  = value[close + 1..-1]
        args   = value[@name.length + 1..close - 1]
        params = list.comma(args)
        params = @newDirection(params)

        if prefix == '-webkit- old'
          @oldWebkit(value, args, params, after)
        else
          @convertDirection(params)
          prefix + @name + '(' + params.join(', ') + ')' + after

      .join(' ')

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
    'right top':    'left bottom, right top'
    'right bottom': 'left top, right bottom'
    'bottom right': 'left top, right bottom'
    'bottom left':  'right top, left bottom'
    'left top':     'right bottom, left top'
    'left bottom':  'right top, left bottom'

  # Replace old direction to new
  newDirection: (params) ->
    first = params[0]

    if first.indexOf('to ') == -1 and isDirection.test(first)
      first = first.split(' ')
      first = for value in first
        @directions[value.toLowerCase()] || value
      params[0] = 'to ' + first.join(' ')

    params

  # Convert to old webkit syntax
  oldWebkit: (value, args, params, after) ->
    return value if args.indexOf('px') != -1
    return value if @name != 'linear-gradient'
    return value if params[0] and params[0].indexOf('deg') != -1
    return value if args.indexOf('-corner') != -1
    return value if args.indexOf('-side')   != -1

    params = @oldDirection(params)
    params = @colorStops(params)

    '-webkit-gradient(linear, ' + params.join(', ') + ')' + after

  # Change new direction to old
  convertDirection: (params) ->
    if params.length > 0
      if params[0][0..2] == 'to '
        params[0] = @fixDirection(params[0])
      else if params[0].indexOf('deg') != -1
        params[0] = @fixAngle(params[0])
      else if params[0].indexOf(' at ') != -1
        @fixRadial(params)

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

      [color, position] = list.space(param)

      unless position?
        # Allow to parse rgba(0,0,0,0)50%
        match = param.match(/^(.*\))(\d.*)$/)
        if match
          color    = match[1]
          position = match[2]

      if position and position.indexOf(')') != -1
        color   += ' ' + position
        position = undefined

      if i == 1 and (position is undefined or position == '0%')
        "from(#{color})"
      else if i == params.length - 1 and (position is undefined or position == '100%')
        "to(#{color})"
      else if position
        "color-stop(#{position}, #{color})"
      else
        "color-stop(#{color})"

  # Fix radial direction syntax
  fixRadial: (params) ->
    first = params[0].split(/\s+at\s+/)
    params.splice(0, 1, first[1], first[0])

  # Remove old WebKit gradient too
  old: (prefix) ->
    if prefix == '-webkit-'
      type   = if @name == 'linear-gradient' then 'linear' else 'radial'
      string = '-gradient'
      regexp = utils.regexp(
        "-webkit-(#{type}-gradient|gradient\\(\\s*#{type})", false)

      new OldValue(@name, prefix + @name, string, regexp)
    else
      super

  # Do not add non-webkit prefixes for list-style and object
  add: (decl, prefix) ->
    p = decl.prop
    if p.indexOf('mask') != -1
      super if prefix == '-webkit-' or prefix == '-webkit- old'
    else if p == 'list-style' or p == 'list-style-image' or p == 'content'
      super if prefix == '-webkit-' or prefix == '-webkit- old'
    else
      super

  process: (node, result) ->
    if @name == 'linear-gradient'
      if /\(\s*(top|left|right|bottom)/.test(node.value)
        result.warn('Gradient has outdated direction syntax. ' +
                    'New syntax is like "to left" instead of "right".')
    super

module.exports = Gradient
