Declaration = require('../declaration')

class TransformDecl extends Declaration
  @names = ['transform', 'transform-origin']

  @functions3d = ['matrix3d', 'translate3d', 'translateZ', 'scale3d', 'scaleZ',
                  'rotate3d', 'rotateX', 'rotateY', 'perspective']

  # Recursively check all parents for @keyframes
  keyframeParents: (decl) ->
    parent = decl.parent
    while parent
      return true if parent.type == 'atrule' and parent.name == 'keyframes'
      parent = parent.parent
    false

  # Is transform caontain 3D commands
  contain3d: (decl) ->
    return false if decl.prop == 'transform-origin'

    for func in TransformDecl.functions3d
      if decl.value.indexOf("#{ func }(") != -1
        return true

    false

  # Replace rotateZ to rotate for IE 9
  set: (decl, prefix) ->
    decl = super
    if prefix == '-ms-'
      decl.value = decl.value.replace(/rotateZ/gi, 'rotate')
    decl

  # Don't add prefix for IE in keyframes
  insert: (decl, prefix, prefixes) ->
    if prefix == '-ms-'
      super if not @contain3d(decl) and not @keyframeParents(decl)
    else if prefix == '-o-'
      super if not @contain3d(decl)
    else
      super

module.exports = TransformDecl
