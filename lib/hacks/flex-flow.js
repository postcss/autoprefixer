flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class FlexFlow extends Declaration
  @names = ['flex-flow', 'box-direction', 'box-orient']

  # Use two properties for 2009 spec
  insert: (decl, prefix, prefixes) ->
    [spec, prefix] = flexSpec(prefix)
    if spec != 2009
      super
    else
      values = decl.value.split(/\s+/).filter (i) ->
        i != 'wrap' && i != 'nowrap' && 'wrap-reverse'
      return if values.length == 0

      already = decl.parent.some (i) ->
        i.prop == prefix + 'box-orient' or i.prop == prefix + 'box-direction'
      return if already

      value = values[0]
      orient = if value.indexOf('row') != -1 then 'horizontal' else 'vertical'
      dir    = if value.indexOf('reverse') != -1 then 'reverse' else 'normal'

      cloned = @clone(decl)
      cloned.prop  = prefix + 'box-orient'
      cloned.value = orient
      if @needCascade(decl)
        cloned.raws.before = @calcBefore(prefixes, decl, prefix)
      decl.parent.insertBefore(decl, cloned)

      cloned = @clone(decl)
      cloned.prop  = prefix + 'box-direction'
      cloned.value = dir
      if @needCascade(decl)
        cloned.raws.before = @calcBefore(prefixes, decl, prefix)
      decl.parent.insertBefore(decl, cloned)

module.exports = FlexFlow
