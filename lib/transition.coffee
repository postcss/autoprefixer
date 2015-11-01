parser = require('postcss-value-parser')
vendor = require('postcss/lib/vendor')

class Transition
  constructor: (@prefixes) ->

  # Properties to be processed
  props: ['transition', 'transition-property']

  # Process transition and add prefies for all necessary properties
  add: (decl) ->
    declPrefixes = @prefixes.add[decl.prop]?.prefixes || []

    params = @parse(decl.value)
    names  = params.map (i) -> i[0].value
    added  = []

    return if names.some (i) -> i[0] == '-'

    for param in params
      prop   = param[0].value
      continue if prop[0] == '-'
      prefixer = @prefixes.add[prop]
      continue unless prefixer

      for prefix in prefixer.prefixes
        prefixed = @prefixes.prefixed(prop, prefix)
        if prefixed != '-ms-transform' and names.indexOf(prefixed) == -1
          added.push(@clone(prefixed, param))

    params = params.concat(added)
    value  = @stringify(params)

    clean = @stringify(@cleanForSafari(params))
    if declPrefixes.indexOf('-webkit-') != -1
      @cloneBefore(decl, '-webkit-' + decl.prop, clean)
    @cloneBefore(decl, decl.prop, clean)

    for prefix in declPrefixes
      if prefix != '-webkit-'
        prefixValue = @stringify(@cleanOtherPrefixes(params, prefix))
        @cloneBefore(decl, prefix + decl.prop, prefixValue)

    if value != decl.value
      decl.cloneBefore()
      decl.value = value

  # Add declaration if it is not exist
  cloneBefore: (decl, prop, value) ->
    already = decl.parent.some (i) -> i.prop == prop and i.value == value
    decl.cloneBefore(prop: prop, value: value) unless already

  # Process transition and remove all unnecessary properties
  remove: (decl) ->

  # Parse properties list to array
  parse: (value) ->
    ast    = parser(value)
    result = []
    param  = []
    for node in ast.nodes
      param.push(node)
      if node.type == 'div' and node.value == ','
        result.push(param)
        param = []
    result.push(param)
    result

  # Return properties string from array
  stringify: (params) ->
    nodes = []
    for param in params
      if param[param.length - 1].type != 'div'
        param.push(@div(params))
      nodes = nodes.concat(param)
    if nodes[0].type == 'div'
      nodes = nodes[1..-1]
    if nodes[nodes.length - 1].type == 'div'
      nodes = nodes[0..-2]
    parser.stringify({ nodes: nodes })

  # Return new param array with different name
  clone: (name, param) ->
    result = []
    for i in param
      result.push(i)
    result[0] = { type: 'word', value: name }
    result

  # Find or create seperator
  div: (params) ->
    for param in params
      for node in param
        if node.type == 'div' and node.value == ','
          return node
    { type: 'div', value: ',', after: ' ' }

  cleanOtherPrefixes: (params, prefix) ->
    params.filter (param) ->
      current = vendor.prefix(param[0].value)
      current == '' or current == prefix

  # Remove all non-webkit prefixes and unprefixed params if we have prefixed
  cleanForSafari: (params) ->
    result = []
    remove = params
      .map (i) -> i[0].value
      .filter (i) -> i[0..7] == '-webkit-'
      .map (i) => @prefixes.unprefixed(i)
    for param in params
      prop   = param[0].value
      prefix = vendor.prefix(prop)
      if remove.indexOf(prop) == -1 and (prefix == '-webkit-' or prefix == '')
        result.push(param)
    result

module.exports = Transition
