sinon = require('sinon')

autoprefixer = require('..')

read = require('fs').readFileSync
css  = (name) ->
  read('test/css/' + name + '.css', 'utf8').trim();

original = autoprefixer.data

autoprefixer.data.browsers =
  chrome:
    future:     [5, 4]
    versions:   [3, 2, 1]
    popularity: [40, 5, 0.5]
    prefix:     '-webkit-'
  ie:
    versions:   [3, 2, 1]
    popularity: [40, 3.5, 0.5]
    prefix:     '-ms-'
  ff:
    versions:   [3, 2, 1]
    popularity: [10, 0.5, 0]
    prefix:     '-moz-'
  opera:
    versions:   [3, 2, 1]
    popularity: [0, 0, 0]
    prefix:     '-o-'

autoprefixer.data.values =
  'linear-gradient':
    browsers: ['chrome 2', 'chrome 1']
    props:    ['background']
    replace:    original.values['linear-gradient'].replace
  calc:
    browsers: ['ie 3', 'chrome 3']
    props:    ['*']
autoprefixer.data.props =
  transform:
    browsers: ['ie 3', 'chrome 1']
    transition: true
  transition:
    browsers: ['chrome 3']
  filter:
    browsers: ['ie 3']
    transition: true
    check:      -> !@match(/DXImageTransform\.Microsoft/)
  'border-top-left-radius':
    browsers: ['ff 1']
    prefixed: '-moz-': '-moz-border-radius-topleft'
  "@keyframes":
    browsers: ['ie 3', 'chrome 3', 'opera 1']

browsers = -> autoprefixer.parse.returnValues[0]

describe 'autoprefixer', ->
  afterEach -> sinon.restore(autoprefixer)

  describe '.compile()', ->

    it 'should compile CSS', ->
      autoprefixer.compile(css('link')).should.equal(css('link.out'))

    it 'should not double same prefixes', ->
      autoprefixer.compile(css('link.out')).should.equal(css('link.out'))

  describe '.parse()', ->
    beforeEach -> sinon.spy(autoprefixer, 'parse')

    it 'should use default requirement', ->
      autoprefixer.rework()
      browsers().should.eql(['chrome 3', 'chrome 2',
                             'ie 3',     'ie 2',
                             'ff 3',     'ff 2'
                             'opera 3',  'opera 2'])

    it 'should parse last versions', ->
      autoprefixer.rework('last 1 versions')
      browsers().should.eql(['chrome 3', 'ie 3', 'ff 3', 'opera 3'])

    it 'should parse popularity', ->
      autoprefixer.rework('> 0.9%')
      browsers().should.eql(['chrome 3', 'chrome 2', 'ie 3', 'ie 2', 'ff 3'])

    it 'should parse manuall', ->
      autoprefixer.rework(['chrome 2', 'ie 2'])
      browsers().should.eql(['chrome 2', 'ie 2'])

  describe '.check()', ->
    beforeEach -> sinon.spy(autoprefixer, 'parse')

    it 'should check browser name', ->
      ( -> autoprefixer.rework('AA 10') ).should.throw('Unknown browser `AA`')

    it 'should check browser version', ->
      ( ->
        autoprefixer.rework('ie')
      ).should.throw("Can't recognize version in `ie`")

    it 'should check browser version', ->
      ( ->
        autoprefixer.rework('2 last version')
      ).should.throw("Unknown browsers requirement `2 last version`")


    it 'should allow future versions', ->
      autoprefixer.rework(['chrome 5'])
      browsers().should.eql(['chrome 5'])

    it 'should normalize browser version', ->
      autoprefixer.rework(['chrome 100', 'ie 0.1', 'ie 7'])
      browsers().should.eql(['chrome 5', 'ie 1', 'ie 3'])

  describe '.filter()', ->

    it 'should filter', ->
      data = autoprefixer.data.props
      autoprefixer.filter(data, ['chrome 2']).should.eql({ })
      autoprefixer.filter(data, ['ie 3', 'chrome 2', 'chrome 1']).should.eql
        transform:
          prefixes:   ['-webkit-', '-ms-']
          browsers:   ['ie 3', 'chrome 2', 'chrome 1']
          transition: true
          regexp:     /(^|\s|,|\()transform($|\s|\()/
        filter:
          prefixes:   ['-ms-']
          browsers:   ['ie 3', 'chrome 2', 'chrome 1']
          transition: true
          check:      autoprefixer.data.props.filter.check
          regexp:     /(^|\s|,|\()filter($|\s|\()/
        "@keyframes":
          prefixes:   ['-ms-']
          browsers:   ['ie 3', 'chrome 2', 'chrome 1']
