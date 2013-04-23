sinon = require('sinon')

autoprefixer = require('..')

read = require('fs').readFileSync
css  = (name) ->
  read('test/css/' + name + '.css', 'utf8').trim();

autoprefixer.data.browsers =
  chrome:
    future:     [5, 4]
    versions:   [3, 2, 1]
    popularity: [45, 5, 0.5]
    prefix:     '-webkit-'
  ie:
    versions:   [3, 2, 1]
    popularity: [45, 4, 0.5]
    prefix:     '-ms-'

autoprefixer.data.values =
  'linear-gradient':
    browsers: ['chrome 2', 'chrome 1']
    props:    ['background']
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
  "@keyframes":
    browsers: ['ie 3', 'chrome 3']

browsers = -> autoprefixer.prefixes.firstCall.args[0]

describe 'autoprefixer', ->
  afterEach -> autoprefixer[i].restore?() for i of autoprefixer

  describe '.compile()', ->

    it 'should compile CSS', ->
      autoprefixer.compile(css('link')).should.equal(css('link.out'))

  describe '.parse()', ->
    beforeEach -> sinon.stub(autoprefixer, 'prefixes').returns([])

    it 'should use default requirement', ->
      autoprefixer.rework()
      browsers().should.eql(['chrome 3', 'chrome 2', 'ie 3', 'ie 2'])

    it 'should parse last versions', ->
      autoprefixer.rework('last 1 versions')
      browsers().should.eql(['chrome 3', 'ie 3'])

    it 'should parse popularity', ->
      autoprefixer.rework('> 0.9%')
      browsers().should.eql(['chrome 3', 'chrome 2', 'ie 3', 'ie 2'])

    it 'should parse manuall', ->
      autoprefixer.rework(['chrome 2', 'ie 2'])
      browsers().should.eql(['chrome 2', 'ie 2'])

  describe '.check()', ->
    beforeEach -> sinon.stub(autoprefixer, 'prefixes').returns([])

    it 'should check browser name', ->
      ( -> autoprefixer.rework('AA 10') ).should.throw('Unknown browser `AA`')

    it 'should check browser version', ->
      ( ->
        autoprefixer.rework('ie')
      ).should.throw("Can't recognize version in `ie`")

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
          regexp:   /(^|\s|,|\()transform($|\s|\()/
          prefixes: ['-webkit-', '-ms-']
          transition: true
        filter:
          regexp:   /(^|\s|,|\()filter($|\s|\()/
          prefixes: ['-ms-']
          transition: true
        "@keyframes":
          prefixes: ['-ms-']
