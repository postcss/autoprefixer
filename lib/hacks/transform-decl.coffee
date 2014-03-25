Declaration = require('../declaration')

class TransformDecl extends Declaration
  @names = ['transform', 'transform-origin']

  # Recursively check all parents for @keyframes
  keykrameParents: (decl) ->
    parent = decl.parent
    while parent
      return true if parent.type == 'atrule' and parent.name == 'keyframes'
      parent = parent.parent
    false

  # Don't add prefix for IE in keyframes
  insert: (decl, prefix, prefixes) ->
    super if prefix != '-ms-' or not @keykrameParents(decl)

module.exports = TransformDecl
