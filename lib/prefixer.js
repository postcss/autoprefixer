Browsers = require('./browsers')
utils    = require('./utils')

vendor = require('postcss/lib/vendor')

# Recursivly clone objects
clone = (obj, parent) ->
  cloned = new obj.constructor()

  for own i, value of obj
    if i == 'parent' and typeof(value) == 'object'
      cloned[i] = parent if parent
    else if i == 'source'
      cloned[i] = value
    else if i == null
      cloned[i] = value
    else if value instanceof Array
      cloned[i] = value.map (i) -> clone(i, cloned)
    else if i != '_autoprefixerPrefix' and i != '_autoprefixerValues'
      if typeof(value) == 'object' && value != null
        value = clone(value, cloned)
      cloned[i] = value

  cloned

class Prefixer
  # Add hack to selected names
  @hack: (klass) ->
    @hacks ||= { }
    for name in klass.names
      @hacks[name] = klass

  # Load hacks for some names
  @load: (name, prefixes, all) ->
    klass = @hacks?[name]
    if klass
      new klass(name, prefixes, all)
    else
      new this(name, prefixes, all)

  # Clone node and clean autprefixer custom caches
  @clone: (node, overrides) ->
    cloned = clone(node)
    for name of overrides
      cloned[name] = overrides[name]
    cloned

  constructor: (@name, @prefixes, @all) ->

  # Find prefix in node parents
  parentPrefix: (node) ->
    prefix = if node._autoprefixerPrefix?
      node._autoprefixerPrefix

    else if node.type == 'decl' and node.prop[0] == '-'
      vendor.prefix(node.prop)

    else if node.type == 'root'
      false

    else if node.type == 'rule' and
            node.selector.indexOf(':-') != -1 and /:(-\w+-)/.test(node.selector)
      node.selector.match(/:(-\w+-)/)[1]

    else if node.type == 'atrule' and node.name[0] == '-'
      vendor.prefix(node.name)

    else
      @parentPrefix(node.parent)

    prefix = false if Browsers.prefixes().indexOf(prefix) == -1
    node._autoprefixerPrefix = prefix

  # Clone node with prefixes
  process: (node) ->
    return unless @check(node)

    parent   = @parentPrefix(node)
    prefixes = []

    for prefix in @prefixes
      continue if parent and parent != utils.removeNote(prefix)
      prefixes.push(prefix)

    added = []
    for prefix in prefixes
      added.push(prefix) if @add(node, prefix, added.concat([prefix]))

    added

  # Shortcut for Prefixer.clone
  clone: (node, overrides) ->
    Prefixer.clone(node, overrides)

module.exports = Prefixer
