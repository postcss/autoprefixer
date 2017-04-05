OldValue = require('../old-value')
Value    = require('../value')
utils    = require('../utils')

parser = require('postcss-value-parser')
range  = require('normalize-range');
list   = require('postcss/lib/list')

isDirection = /top|left|right|bottom/gi

class Gradient extends Value
  @names = ['linear-gradient', 'repeating-linear-gradient',
            'radial-gradient', 'repeating-radial-gradient']

  # Change degrees for webkit prefix
  replace: (string, prefix) ->
    ast = parser(string)
    for node in ast.nodes
      if node.type == 'function' and node.value == @name
        node.nodes = @newDirection(node.nodes)
        node.nodes = @normalize(node.nodes)
        if prefix == '-webkit- old'
          changes = @oldWebkit(node)
          return unless changes
        else
          node.nodes = @convertDirection(node.nodes)
          node.value = prefix + node.value
    ast.toString()

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

  # Replace first token
  replaceFirst: (params, words...) ->
    prefix = words.map (i) ->
      if i == ' '
        { type: 'space', value: i }
      else
        { type: 'word', value: i }
    return prefix.concat(params.slice(1))

  # Convert angle unit to deg
  normalizeUnit: (str, full) ->
    num = parseFloat(str)
    deg = (num / full) * 360
    "#{ deg }deg"

  # Normalize angle
  normalize: (nodes) ->
    return nodes unless nodes[0]

    if /-?\d+(.\d+)?grad/.test(nodes[0].value)
      nodes[0].value = @normalizeUnit(nodes[0].value, 400)
    else if /-?\d+(.\d+)?rad/.test(nodes[0].value)
      nodes[0].value = @normalizeUnit(nodes[0].value, 2 * Math.PI)
    else if /-?\d+(.\d+)?turn/.test(nodes[0].value)
      nodes[0].value = @normalizeUnit(nodes[0].value, 1)
    else if nodes[0].value.indexOf('deg') != -1
      num = parseFloat(nodes[0].value)
      num = range.wrap(0, 360, num)
      nodes[0].value = "#{num}deg"

    if nodes[0].value == '0deg'
      nodes = @replaceFirst(nodes, 'to', ' ', 'top')
    else if nodes[0].value == '90deg'
      nodes = @replaceFirst(nodes, 'to', ' ', 'right')
    else if nodes[0].value == '180deg'
      nodes = @replaceFirst(nodes, 'to', ' ', 'bottom')
    else if nodes[0].value == '270deg'
      nodes = @replaceFirst(nodes, 'to', ' ', 'left')

    nodes

  # Replace old direction to new
  newDirection: (params) ->
    return params if params[0].value == 'to'
    return params unless isDirection.test(params[0].value)
    params.unshift({ type: 'word', value: 'to' }, { type: 'space', value: ' ' })
    for i in [2...params.length]
      if params[i].type == 'div'
        break
      if params[i].type == 'word'
        params[i].value = @revertDirection(params[i].value)

    params

  # Change new direction to old
  convertDirection: (params) ->
    if params.length > 0
      if params[0].value == 'to'
        @fixDirection(params)
      else if params[0].value.indexOf('deg') != -1
        @fixAngle(params)
      else if params[2].value == 'at'
        @fixRadial(params)
    params

  # Replace `to top left` to `bottom right`
  fixDirection: (params) ->
    params.splice(0, 2)
    for i in [0...params.length]
      if params[i].type == 'div'
        break
      if params[i].type == 'word'
        params[i].value = @revertDirection(params[i].value)

  # Add 90 degrees
  fixAngle: (params) ->
    first = params[0].value
    first = parseFloat(first)
    first = Math.abs(450 - first) % 360
    first = @roundFloat(first, 3)
    params[0].value = "#{first}deg"

  # Fix radial direction syntax
  fixRadial: (params) ->
    first  = params[0]
    second = []

    for i in [4...params.length]
      if params[i].type == 'div'
        break
      else
        second.push(params[i])

    params.splice(0, i, second..., params[i + 2], first)

  revertDirection: (word) ->
    @directions[word.toLowerCase()] || word

  # Round float and save digits under dot
  roundFloat: (float, digits) ->
    parseFloat(float.toFixed(digits))

  # Convert to old webkit syntax
  oldWebkit: (node) ->
    nodes  = node.nodes
    string = parser.stringify(node.nodes)

    return false if @name != 'linear-gradient'
    return false if nodes[0] and nodes[0].value.indexOf('deg') != -1
    return false if string.indexOf('px') != -1
    return false if string.indexOf('-corner') != -1
    return false if string.indexOf('-side')   != -1

    params = [[]]
    for i in nodes
      params[params.length - 1].push(i)
      if i.type == 'div' && i.value == ','
        params.push([])

    @oldDirection(params)
    @colorStops(params)

    node.nodes = []
    for param in params
      node.nodes = node.nodes.concat(param)

    node.nodes.unshift({ type: 'word', value: 'linear' }, @cloneDiv(node.nodes))
    node.value = '-webkit-gradient'

    true

  # Change direction syntax to old webkit
  oldDirection: (params) ->
    div = @cloneDiv(params[0])

    if params[0][0].value != 'to'
      params.unshift([{ type: 'word', value: @oldDirections.bottom }, div])

    else
      words = []
      for node in params[0].slice(2)
        if node.type == 'word'
          words.push(node.value.toLowerCase())

      words = words.join(' ')
      old   = @oldDirections[words] || words

      params[0] = [{ type: 'word', value: old }, div]

  # Get div token from exists parameters
  cloneDiv: (params) ->
    for i in params
      if i.type == 'div' and i.value == ','
        return i
    return { type: 'div', value: ',', after: ' ' }

  # Change colors syntax to old webkit
  colorStops: (params) ->
    for param, i in params
      continue if i == 0

      color = parser.stringify(param[0])
      if param[1] and param[1].type == 'word'
        pos = param[1].value
      else if param[2] and param[2].type == 'word'
        pos = param[2].value

      stop = if i == 1 and (not pos or pos == '0%')
        "from(#{color})"
      else if i == params.length - 1 and (not pos or pos == '100%')
        "to(#{color})"
      else if pos
        "color-stop(#{pos}, #{color})"
      else
        "color-stop(#{color})"

      div = param[param.length - 1]
      params[i] = [{ type: 'word', value: stop }]
      if div.type == 'div' and div.value == ','
        params[i].push(div)

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

module.exports = Gradient
