parser = require('postcss-value-parser')

Declaration = require('../declaration')

class GridTemplate extends Declaration
  @names = ['grid-template-rows', 'grid-template-columns',
            'grid-rows', 'grid-columns']

  # Change property name for IE
  prefixed: (prop, prefix) ->
    if prefix == '-ms-'
      prefix + prop.replace('template-', '')
    else
      super(prop, prefix)

  # Change IE property back
  normalize: (prop) ->
    prop.replace(/^grid-(rows|columns)/, 'grid-template-$1')

  # Recursive part of changeRepeat
  walkRepeat: (node) ->
    fixed = []
    for i in node.nodes
      @walkRepeat(i) if i.nodes
      fixed.push(i)
      if i.type == 'function' and i.value == 'repeat'
        first = i.nodes.shift()
        if first
          count = first.value
          i.nodes.shift()
          i.value = ''
          fixed.push({ type: 'word', value: "[#{ count }]" })
    node.nodes = fixed

  # IE repeating syntax
  changeRepeat: (value) ->
    ast = parser(value)
    @walkRepeat(ast)
    ast.toString()

  # Change repeating syntax for IE
  set: (decl, prefix) ->
    if prefix == '-ms-' and decl.value.indexOf('repeat(') != -1
      decl.value = @changeRepeat(decl.value)
    super(decl, prefix)

module.exports = GridTemplate
