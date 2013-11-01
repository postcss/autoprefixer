Browsers = require('./browsers')
vendor   = require('postcss/lib/vendor')
utils    = require('./utils')

class Prefixer
  # Load hacks for some names
  @load: (name, prefixes) ->
    new this(name, prefixes)

  constructor: (@name, @prefixes) ->

  # Find prefix in node parents
  parentPrefix: (node) ->
    prefix = if node._autoprefixerPrefix?
      node._autoprefixerPrefix

    else if node.type == 'root'
      false

    else if node.type == 'rule' and node.selector.indexOf(':-') != -1
      node.selector.match(/:(-\w+-)/)[1]

    else if node.type == 'atrule' and node.name[0] == '-'
      vendor.split(node.name).prefix

    else
      @parentPrefix(node.parent)

    prefix = false if Browsers.prefixes().indexOf(prefix) == -1
    node._autoprefixerPrefix = prefix

  # Clone node with prefixes
  process: (node) ->
    return unless @check(node)

    parent = @parentPrefix(node.parent)

    for prefix in @prefixes
      continue if parent and parent != utils.removeNote(prefix)
      @add(node, prefix)

module.exports = Prefixer
