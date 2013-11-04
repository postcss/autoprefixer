Browsers = require('./browsers')
vendor   = require('postcss/lib/vendor')
utils    = require('./utils')

class Prefixer
  # Add hack to selected names
  @hack: (klass) ->
    @hacks ||= { }
    for name in klass.names
      @hacks[name] = klass

  # Load hacks for some names
  @load: (name, prefixes) ->
    klass = @hacks?[name]
    if klass
      new klass(name, prefixes)
    else
      new this(name, prefixes)

  # Clone node and clean autprefixer custom caches
  @clone: (node, overrides) ->
    cloned = node.clone(overrides)
    delete cloned._autoprefixerPrefix
    delete cloned._autoprefixerValues
    cloned

  constructor: (@name, @prefixes) ->

  # Find prefix in node parents
  parentPrefix: (node) ->
    prefix = if node._autoprefixerPrefix?
      node._autoprefixerPrefix

    else if node.type == 'decl' and node.prop[0] == '-'
      vendor.prefix(node.prop)

    else if node.type == 'root'
      false

    else if node.type == 'rule' and node.selector.indexOf(':-') != -1
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

    parent = @parentPrefix(node)

    for prefix in @prefixes
      continue if parent and parent != utils.removeNote(prefix)
      @add(node, prefix)

  # Shortcut for Prefixer.clone
  clone: (node, overrides) ->
    Prefixer.clone(node, overrides)

module.exports = Prefixer
