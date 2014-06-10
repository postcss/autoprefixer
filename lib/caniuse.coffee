module.exports =

  # Autoprefixer to Can I Use browser names
  browsers:
    firefox: 'ff'
    chrome:  'chrome'
    safari:  'safari'
    ios_saf: 'ios'
    opera:   'opera'
    ie:      'ie'
    bb:      'bb'
    android: 'android'

  # Correct sort by float versions
  sort: (browsers) ->
    browsers.sort (a, b) ->
      a = a.split(' ')
      b = b.split(' ')
      if a[0] > b[0]
        1
      else if a[0] < b[0]
        -1
      else
        parseFloat(a[1]) - parseFloat(b[1])

  # Parse browsers list in feature file
  parse: (data, opts) ->
    match = if opts.full then /y\sx($|\s)/ else /\sx($|\s)/
    need  = []

    for browser, versions of data.stats
      for interval, support of versions
        for version in interval.split('-')
          if @browsers[browser] and support.match(match)
            version = version.replace(/\.0$/, '')
            need.push(@browsers[browser] + ' ' + version)

    @sort(need)

  # Can I Use shortcut to request files in features/ dir.
  feature: (data, opts, callback) ->
    [callback, opts] = [opts, { }] unless callback
    callback module.exports.parse(data, opts)

  # Change browser array
  map: (browsers, callback) ->
    for browser in browsers
      [name, version] = browser.split(' ')
      version = parseFloat(version)

      callback(browser, name, version)
