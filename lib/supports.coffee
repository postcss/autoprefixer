Value = require('./value')

postcss = require('postcss')

findDecls = /\(\s*([^\):]+)\s*:\s*([^\)]+)\s*\)/

class Supports
  constructor: (@all) ->

  # Create virtual rule to process it by prefixer
  virtual: (prop, value) ->
    rule = postcss.parse('a{}').first
    rule.append( prop: prop, value: value, before: '' )
    rule

  # Return array of Declaration with all necessary prefixes
  prefixed: (prop, value) ->
    rule = @virtual(prop, value)

    prefixer = @all.add[prop]
    prefixer.process?(rule.first)

    for decl in rule.decls
      for value in @all.values('add', prop)
        value.process(decl)
      Value.save(@all, decl)

    rule.decls

  # Add prefixed declaration
  process: (rule) ->
    rule.params = rule.params.replace findDecls, (all, prop, value) =>
      prefixed = for i in @prefixed(prop, value)
        "(#{ i.prop }: #{ i.value })"
      '(' + prefixed.join(' or ') + ')'

module.exports = Supports
