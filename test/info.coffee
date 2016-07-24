Browsers = require('../lib/browsers')
Prefixes = require('../lib/prefixes')
info     = require('../lib/info')

data =
  browsers: require('caniuse-db/data.json').agents
  prefixes:
    a:
      browsers: ['firefox 21', 'firefox 20', 'chrome 30']
      transition: true
    b:
      browsers: ['ie 6', 'firefox 20']
      props:    ['a', '*']
    c:
      browsers: ['firefox 21']
      props:    ['c']
    d:
      browsers: ['firefox 21']
      selector:   true
    '@keyframes':
      browsers: ['firefox 21']
    transition:
      browsers: ['firefox 21']

describe 'info', ->

  it 'returns selected browsers and prefixes', ->
    browsers = new Browsers(data.browsers,
      ['chrome 30', 'firefox 21', 'firefox 20', 'ie 6'])
    prefixes = new Prefixes(data.prefixes, browsers)

    info(prefixes).should.eql "Browsers:\n" +
                              "  Chrome: 30\n" +
                              "  Firefox: 21, 20\n" +
                              "  IE: 6\n" +
                              "\n" +
                              "These browsers account for 0.13% " +
                                "of all users globally\n" +
                              "\n" +
                              "At-Rules:\n" +
                              "  @keyframes: moz\n" +
                              "\n" +
                              "Selectors:\n" +
                              "  d: moz\n" +
                              "\n" +
                              "Properties:\n" +
                              "  a: webkit, moz\n" +
                              "  transition: moz\n" +
                              "\n" +
                              "Values:\n" +
                              "  b: moz, ms\n" +
                              "  c: moz\n"

  it "doesn't show transitions unless they are necessary", ->
    browsers = new Browsers(data.browsers, ['chrome 30', 'firefox 20', 'ie 6'])
    prefixes = new Prefixes(data.prefixes, browsers)

    info(prefixes).should.eql "Browsers:\n" +
                              "  Chrome: 30\n" +
                              "  Firefox: 20\n" +
                              "  IE: 6\n" +
                              "\n" +
                              "These browsers account for 0.09% " +
                                "of all users globally\n" +
                              "\n" +
                              "Properties:\n" +
                              "  a: webkit, moz\n" +
                              "\n" +
                              "Values:\n" +
                              "  b: moz, ms\n"

  it 'returns string for empty prefixes', ->
    browsers = new Browsers(data.browsers, ['ie 7'])
    prefixes = new Prefixes(data.prefixes, browsers)

    info(prefixes).should.match(/remove Autoprefixer/)

  it 'returns string for empty browsers', ->
    browsers = new Browsers(data.browsers, [])
    prefixes = new Prefixes(data.prefixes, browsers)

    info(prefixes).should.eql "No browsers selected"
