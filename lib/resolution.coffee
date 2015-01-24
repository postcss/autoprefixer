Prefixer = require('./prefixer')
utils    = require('./utils')

list = require('postcss/lib/list')

regexp = /(min|max)-resolution\s*:\s*\d+(dppx|dpi)/g
split  = /(min|max)-resolution(\s*:\s*)(\d+)(dppx|dpi)/

class Resolution extends Prefixer

  prefix: (prefix, name, colon, value, units) ->
    name = if prefix == '-moz-'
      name + '--moz-device-pixel-ratio'
    else
      prefix + name + '-device-pixel-ratio'

    value = if units == 'dpi'
      Math.round(value / 96)
    else if units == 'dppx'
      value

    name + colon + value

  process: (rule) ->
    parent   = @parentPrefix(rule)
    prefixes = if parent then [parent] else @prefixes

    origin    = list.comma(rule.params)
    prefixeds = []

    for query in origin
      if query.indexOf('min-resolution') == -1 and
         query.indexOf('max-resolution') == -1
        prefixed.push(query)
        continue

      for prefix in prefixes
        prefixed = query.replace regexp, (str) =>
          parts = str.match(split)
          @prefix(prefix, parts[1], parts[2], parts[3], parts[4])
        prefixeds.push(prefixed)

      prefixeds.push(query)

    prefixeds = utils.uniq(prefixeds)
    if origin != prefixeds
      join = rule.params.match(/,\s*/)
      join = if join then join[0] else ', '
      rule.params = prefixeds.join(join)

module.exports = Resolution
