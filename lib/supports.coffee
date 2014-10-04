Prefixes = require('./prefixes')
Value    = require('./value')
utils    = require('./utils')

postcss = require('postcss')
list    = require('postcss/lib/list')

split         = /\(\s*([^\(\):]+)\s*:([^\)]+)/
findDecl      = /\(\s*([^\(\):]+)\s*:\s*([^\)]+)\s*\)/g
findCondition = /(not\s*)?\(\s*([^\(\):]+)\s*:\s*([^\)]+)\s*\)\s*or\s*/gi

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
    prefixer?.process?(rule.first)

    for decl in rule.childs
      for value in @all.values('add', prop)
        value.process(decl)
      Value.save(@all, decl)

    rule.childs

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

      .replace(/\(\s*\((.*)\)\s*\)/g, '($1)')

  # Add prefixed declaration
  process: (rule) ->
    rule.params = @clean(rule.params)
    rule.params = rule.params.replace findDecl, (all, prop, value) =>
      stringed = ("(#{ i.prop }: #{ i.value })" for i in @prefixed(prop, value))

      if stringed.length == 1
        stringed[0]
      else
        '(' + stringed.join(' or ') + ')'

module.exports = Supports
