module.exports = ->
  minor = ['bb', 'android']

  @github 'Fyrd/caniuse/master/data.json', (data) =>
    normalize = (array) -> array.reverse().filter (i) -> i

    intervals = (array) ->
      result = []
      for interval in array
        splited = interval.split('-')
        splited = splited.sort().reverse()
        sub     = ([i, interval, splited.length] for i in splited)
        result  = result.concat(sub)
      result

    agent = (name) ->
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

    browsers = { }
    for caniuse, internal of @browsers
      browsers[internal] = agent(caniuse)

    @save('browsers', browsers)
