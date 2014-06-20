# Browsers, which interested for Autoprefixer
names = ['firefox', 'chrome', 'safari', 'ios_saf',
         'opera', 'ie', 'bb', 'android']

# Browsers, that will be used in "last 2 version" and same selections
major = ['firefox', 'chrome', 'safari', 'ios_saf', 'opera', 'ie']

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
convert = (name, data) ->
  future   = normalize(data.versions[-3..-1])
  versions = intervals(normalize(data.versions[0..-4]))
  result   = {}

  result.prefix    = if name == 'opera' then '-o-' else "-#{data.prefix}-"
  result.minor      = true   if major.indexOf(name) == -1
  result.future     = future if future.length
  result.versions   = versions.map (i) -> i[0]
  result.popularity = versions.map (i) -> data.usage_global[i[1]] / i[2]
  result

module.exports = { }
for name, data of require('caniuse-db/data').agents
  module.exports[name] = convert(name, data)
