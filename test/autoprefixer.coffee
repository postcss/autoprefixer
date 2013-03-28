sinon = require('sinon')
require('chai').use(require('sinon-chai')).should()

autoprefixer = require('..')

read = require('fs').readFileSync
css  = (name) ->
  read('test/css/' + name + '.css', 'utf8').trim();

autoprefixer.data.browsers =
  chrome:
    versions: [3, 2, 1]
    popularity: [45, 4, 1]
    prefix: '-webkit-'
  ie:
    versions: [3, 2, 1]
    popularity: [45, 4, 1]
    prefix: '-ms-'

autoprefixer.data.props =
  'transform':
    browsers: ['ie 3', 'chrome 1']
    transition: true
  'linear-gradient':
    browsers: ['chrome 2', 'chrome 1']
    onlyValue: true

describe 'autoprefixer', ->
  afterEach -> autoprefixer[i].restore?() for i of autoprefixer

  describe '.filter()', ->
    beforeEach -> sinon.stub(autoprefixer, 'parse').returns([])

    it 'should use default requirement', ->
      autoprefixer.filter()
      autoprefixer.parse.should.have.been.calledWith(['last 2 versions'])

  describe '.compile()', ->

    it 'should compile CSS', ->
      autoprefixer.compile(css('link')).should.equal(css('link.out'))

  describe '.parse()', ->
    beforeEach -> sinon.stub(autoprefixer, 'props').returns([])

    it 'should parse last versions', ->
      autoprefixer.filter('last 1 versions')
      autoprefixer.props.should.have.been.calledWith(['chrome 3', 'ie 3'])

    it 'should parse popularity', ->
      autoprefixer.filter('> 40%')
      autoprefixer.props.should.have.been.calledWith(['chrome 3', 'ie 3'])

    it 'should parse manuall', ->
      autoprefixer.filter(['chrome 2', 'ie 2'])
      autoprefixer.props.should.have.been.calledWith(['chrome 2', 'ie 2'])

  describe '.check()', ->
    beforeEach -> sinon.stub(autoprefixer, 'props').returns([])

    it 'should check browser name', ->
      ( -> autoprefixer.filter('AA 10') ).should.throw('Unknown browser `AA`')

    it 'should check browser version', ->
      ( -> autoprefixer.filter('ie') ).should.throw("Can't recognize version in `ie`")

    it 'should normalize browser version', ->
      autoprefixer.filter(['chrome 100', 'chrome 0.1'])
      autoprefixer.props.should.have.been.calledWith(['chrome 3', 'chrome 1'])

  describe '.props()', ->

    it 'should return props', ->
      autoprefixer.props(['chrome 2']).should.eql([
        {
          name:      'linear-gradient',
          prefixes: ['-webkit-'],
          onlyValue:  true,
          transition: undefined
        }
      ])
      autoprefixer.props(['ie 3', 'chrome 2', 'chrome 1']).should.eql([
        {
          name:      'transform',
          prefixes: ['-ms-', '-webkit-'],
          onlyValue:  undefined,
          transition: true
        },
        {
          name:      'linear-gradient',
          prefixes: ['-webkit-'],
          onlyValue:  true,
          transition: undefined
        }
      ])
