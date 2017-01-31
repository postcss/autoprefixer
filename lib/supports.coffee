Browsers = require('./browsers')
brackets = require('./brackets')
Value    = require('./value')
utils    = require('./utils')

postcss = require('postcss')

supported = []
data      = require('caniuse-db/features-json/css-featurequeries.json')
for browser, versions of data.stats
  for version, support of versions
    supported.push(browser + ' ' + version) if /y/.test(support)

class Supports
  constructor: (@Prefixes, @all) ->

  # Return prefixer only with @supports supported browsers
  prefixer: ->
    return @prefixerCache if @prefixerCache

    filtered = @all.browsers.selected.filter (i) =>
      supported.indexOf(i) != -1

    browsers = new Browsers(@all.browsers.data, filtered, @all.options)
    @prefixerCache = new @Prefixes(@all.data, browsers, @all.options)

  # Parse string into declaration property and value
  parse: (str) ->
    [prop, value] = str.split(':')
    value ||= ''
    return [prop.trim(), value.trim()]

  # Create virtual rule to process it by prefixer
  virtual: (str) ->
    [prop, value] = @parse(str)
    rule = postcss.parse('a{}').first
    rule.append( prop: prop, value: value, raws: before: '' )
    rule

  # Return array of Declaration with all necessary prefixes
  prefixed: (str) ->
    rule = @virtual(str)
    return rule.nodes if @disabled(rule.first)

    prefixer = @prefixer().add[rule.first.prop]
    prefixer?.process?(rule.first)

    for decl in rule.nodes
      for value in @prefixer().values('add', rule.first.prop)
        value.process(decl)
      Value.save(@all, decl)

    rule.nodes

  # Return true if brackets node is "not" word
  isNot: (node) ->
    typeof node == 'string' and /not\s*/i.test(node)

  # Return true if brackets node is "or" word
  isOr: (node) ->
    typeof node == 'string' and /\s*or\s*/i.test(node)

  # Return true if brackets node is (prop: value)
  isProp: (node) ->
    typeof node == 'object' and node.length == 1 and typeof node[0] == 'string'

  # Return true if prefixed property has no unprefixed
  isHack: (all, unprefixed) ->
    check = new RegExp('(\\(|\\s)' + utils.escapeRegexp(unprefixed) + ':')
    !check.test(all)

  # Return true if we need to remove node
  toRemove: (str, all) ->
    [prop, value] = @parse(str)
    unprefixed = @all.unprefixed(prop)

    if @all.cleaner().remove[prop]?.remove and not @isHack(all, unprefixed)
      return true

    for checker in @all.cleaner().values('remove', unprefixed)
      if checker.check(value)
        return true

    false

  # Remove all unnecessary prefixes
  remove: (nodes, all) ->
    i = 0
    while i < nodes.length
      if not @isNot(nodes[i - 1]) and @isProp(nodes[i]) and @isOr(nodes[i + 1])
        if @toRemove(nodes[i][0], all)
          nodes.splice(i, 2)
        else
          i += 2
      else
        if typeof nodes[i] == 'object'
          nodes[i] = @remove(nodes[i], all)
        i += 1
    nodes

  # Clean brackets with one child
  cleanBrackets: (nodes) ->
    nodes.map (i) =>
      if typeof i == 'object'
        if i.length == 1 and typeof i[0] == 'object'
          @cleanBrackets(i[0])
        else
          @cleanBrackets(i)
      else
        i

  # Add " or " between properties and convert it to brackets format
  convert: (progress) ->
    result = ['']
    for i in progress
      result.push(["#{ i.prop }: #{ i.value }"])
      result.push(' or ')
    result[result.length - 1] = ''
    result

  # Compress value functions into a string nodes
  normalize: (nodes) ->
    if typeof nodes == 'object'
      nodes = nodes.filter (i) -> i != ''
      if typeof nodes[0] == 'string' and nodes[0].indexOf(':') != -1
        [brackets.stringify(nodes)]
      else
        nodes.map (i) => @normalize(i)
    else
      nodes

  # Add prefixes
  add: (nodes, all) ->
    nodes.map (i) =>
      if @isProp(i)
        prefixed = @prefixed(i[0])
        if prefixed.length > 1
          @convert(prefixed)
        else
          i
      else if typeof i == 'object'
        @add(i, all)
      else
        i

  # Add prefixed declaration
  process: (rule) ->
    ast = brackets.parse(rule.params)
    ast = @normalize(ast)
    ast = @remove(ast, rule.params)
    ast = @add(ast, rule.params)
    ast = @cleanBrackets(ast)
    rule.params = brackets.stringify(ast)

  # Check global options
  disabled: (node) ->
    if @all.options.grid == false
      if node.prop == 'display' and node.value.indexOf('grid') != -1
        return true
      if node.prop.indexOf('grid') != -1 or node.prop == 'justify-items'
        return true

    if @all.options.flexbox == false
      if node.prop == 'display' and node.value.indexOf('flex') != -1
        return true
      other = ['order', 'justify-content', 'align-items', 'align-content']
      if node.prop.indexOf('flex') != -1 or other.indexOf(node.prop) != -1
        return true

    false

module.exports = Supports
