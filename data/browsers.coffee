data = require('caniuse-db/data')

# Browsers, that not be used in "last 2 version" and same selections
minor = ['bb', 'android']

# Autoprefixer to Can I Use browser names
browsers =
  firefox: 'ff'
  chrome:  'chrome'
  safari:  'safari'
  ios_saf: 'ios'
  opera:   'opera'
  ie:      'ie'
  bb:      'bb'
  android: 'android'

# Normalize Can I Use versions array
normalize = (array) -> array.reverse().filter (i) -> i

# Expand versions intervals from Can I Use
intervals = (array) ->
  result = []
  for interval in array
    splited = interval.split('-')
    splited = splited.sort().reverse()
    sub     = ([i, interval, splited.length] for i in splited)
    result  = result.concat(sub)
  result

# Convert Can I Use data to Autoprefixer’s
convert = (name) ->
  info     = data.agents[name]
  future   = normalize(info.versions[-3..-1])
  versions = intervals(normalize(info.versions[0..-4]))
  result   = {}

  result.prefix    = if name == 'opera' then '-o-' else "-#{info.prefix}-"
  result.minor      = true   if minor.indexOf(name) != -1
  result.future     = future if future.length
  result.versions   = versions.map (i) -> i[0]
  result.popularity = versions.map (i) -> info.usage_global[i[1]] / i[2]
  result

module.exports = { }
for caniuse, internal of browsers
  module.exports[internal] = convert(caniuse)
