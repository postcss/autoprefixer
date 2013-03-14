sinon = require('sinon')
chai  = require('chai')
chai.use(require('sinon-chai')).should()

vendors = require('..')

read = require('fs').readFileSync
css  = (name) ->
  read('test/css/' + name + '.css', 'utf8').trim();

vendors.data.browsers =
  chrome:
    versions: [3, 2, 1]
    popularity: [45, 4, 1]
    prefix: '-webkit-'
  ie:
    versions: [3, 2, 1]
    popularity: [45, 4, 1]
    prefix: '-ms-'

vendors.data.props =
  'transform':
    browsers: ['ie 3', 'chrome 1']
    transition: true
  'linear-gradient':
    browsers: ['chrome 2', 'chrome 1']
    onlyValue: true

describe 'vendors', ->
  afterEach -> vendors[i].restore?() for i of vendors

  describe '()', ->
    beforeEach -> sinon.stub(vendors, 'parse').returns([])

    it 'should accept arguments', ->
      vendors('ie 3', 'ie 2')
      vendors.parse.should.have.been.calledWith(['ie 3', 'ie 2'])

    it 'should accept array', ->
      vendors(['ie 3', 'ie 2'])
      vendors.parse.should.have.been.calledWith(['ie 3', 'ie 2'])

    it 'should use default requirement', ->
      vendors()
      vendors.parse.should.have.been.calledWith(['last 2 versions'])

  describe '.compile()', ->

    it 'should compile CSS', ->
      vendors.compile(css('link')).should.equal(css('link.out'))

  describe '.parse()', ->
    beforeEach -> sinon.stub(vendors, 'props').returns([])

    it 'should parse last versions', ->
      vendors('last 1 versions')
      vendors.props.should.have.been.calledWith(['chrome 3', 'ie 3'])

    it 'should parse popularity', ->
      vendors('> 40%')
      vendors.props.should.have.been.calledWith(['chrome 3', 'ie 3'])

    it 'should parse manuall', ->
      vendors('chrome 2', 'ie 2')
      vendors.props.should.have.been.calledWith(['chrome 2', 'ie 2'])

  describe '.check()', ->
    beforeEach -> sinon.stub(vendors, 'props').returns([])

    it 'should check browser name', ->
      ( -> vendors('AA 10') ).should.throw('Unknown browser `AA`')

    it 'should check browser version', ->
      ( -> vendors('ie') ).should.throw("Can't recognize version in `ie`")

    it 'should normalize browser version', ->
      vendors('chrome 100', 'chrome 0.1')
      vendors.props.should.have.been.calledWith(['chrome 3', 'chrome 1'])

  describe '.props()', ->

    it 'should return props', ->
      vendors.props(['chrome 2']).should.eql([
        {
          name:      'linear-gradient',
          prefixes: ['-webkit-'],
          onlyValue:  true,
          transition: undefined
        }
      ])
      vendors.props(['ie 3', 'chrome 2', 'chrome 1']).should.eql([
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
