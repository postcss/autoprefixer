Prefixes = require('./prefixes')
Value    = require('./value')
utils    = require('./utils')

postcss = require('postcss')
parser  = require('postcss-value-parser')
list    = require('postcss/lib/list')

split         = /\(\s*([^\(\):]+)\s*:([^\)]+)/
findDecl      = /\(\s*([^\(\):]+)\s*:\s*(.+)\s*\)/g
findCondition = /(not\s*)?\(\s*([^\(\):]+)\s*:\s*(.+?(?!\s*or\s*).+?)\s*\)*\s*\)\s*or\s*/gi

class Supports
  constructor: (@all) ->

  # Create virtual rule to process it by prefixer
  virtual: (prop, value) ->
    rule = postcss.parse('a{}').first
    rule.append( prop: prop, value: value, raws: before: '' )
    rule

  # Return array of Declaration with all necessary prefixes
  prefixed: (prop, value) ->
    rule = @virtual(prop, value)

    prefixer = @all.add[prop]
    prefixer?.process?(rule.first)

    for decl in rule.nodes
      for value in @all.values('add', prop)
        value.process(decl)
      Value.save(@all, decl)

    rule.nodes

  # Remove all unnecessary prefixes
  clean: (params) ->
    params
      .replace findCondition, (all) =>
        return all if all[0..2].toLowerCase() == 'not'

        [_, prop, value] = all.match(split)
        unprefixed = @all.unprefixed(prop)

        if @all.cleaner().remove[prop]?.remove
          check = new RegExp('(\\(|\\s)' + utils.escapeRegexp(unprefixed) + ':')
          return '' if check.test(params)

        for checker in @all.cleaner().values('remove', unprefixed)
          if checker.check(value)
            return ''

        all

  # Check value node for brackets
  isBrackets: (node) ->
    node.type == 'function' and node.value == ''

  # Recursively part of brackets
  walkBrackets: (nodes) ->
    nodes.map (node) =>
      if not @isBrackets(node)
        node
      else
        node.nodes = @walkBrackets(node.nodes)
        if node.nodes.length == 1 and @isBrackets(node.nodes[0])
          node.nodes[0]
        else
          node

  # Clean unnecessary brackets
  brackets: (params) ->
    ast = parser(params)
    ast.nodes = @walkBrackets(ast.nodes)
    parser.stringify(ast)

  # Add prefixed declaration
  process: (rule) ->
    rule.params = @clean(rule.params)
    rule.params = @brackets(rule.params)

    rule.params = rule.params.replace findDecl, (all, prop, value) =>
      stringed = ("(#{ i.prop }: #{ i.value })" for i in @prefixed(prop, value))

      if stringed.length == 1
        stringed[0]
      else
        '((' + stringed.join(') or (') + '))'
    rule.params = @brackets(rule.params)

module.exports = Supports
