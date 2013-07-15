Browsers = require('../lib/autoprefixer/browsers')

data =
  ie:
    prefix:     '-ms-'
    versions:   [3, 2, 1]
    popularity: [1, 0.4, 0.1]
  chrome:
    prefix:     '-webkit-'
    future:     [5, 4]
    versions:   [3, 2, 1]
    popularity: [1, 0.5, 0.1]
  opera:
    prefix:     '-o-'
    versions:   [15, 4, 3, 2]
    popularity: [0.3, 0.1, 0.1]
    minor:      true
  bb:
    prefix:     '-webkit-'
    versions:   [1]
    popularity: [0]
    minor:      true

describe 'Browsers', ->

  describe 'parse()', ->

    it 'should use 2 last version by default', ->
      browsers = new Browsers(data)
      browsers.selected.should.eql ['ie 3', 'ie 2', 'chrome 3', 'chrome 2']

    it 'should convert browsers to array', ->
      browsers = new Browsers(data, ['last 2 versions'])
      browsers.selected.should.eql ['ie 3', 'ie 2', 'chrome 3', 'chrome 2']

    it 'should allow to select no browsers', ->
      browsers = new Browsers(data, ['none'])
      browsers.selected.should.be.empty

    it 'should raise error on unknown requirement', ->
      ( ->
        new Browsers(data, 'unknown')
      ).should.throw('Unknown browser requirement `unknown`')

    it 'should select latest versions', ->
      browsers = new Browsers(data, ['last 1 version'])
      browsers.selected.should.eql ['ie 3', 'chrome 3']

    it 'should select by popularity', ->
      browsers = new Browsers(data, ['> 0.2%'])
      browsers.selected.should.eql ['ie 3', 'ie 2',
                                    'chrome 3', 'chrome 2',
                                    'opera 15']

    it 'should select directly', ->
      browsers = new Browsers(data, ['chrome 5', 'opera 4'])
      browsers.selected.should.eql ['chrome 5', 'opera 4']

    it 'should select unreleased versions', ->
      browsers = new Browsers(data, ['chrome 10', 'opera 1'])
      browsers.selected.should.eql ['chrome 5', 'opera 2']

    it 'should combine requirements', ->
      browsers = new Browsers(data, ['last 2 versions', '> 0.4%'])
      browsers.selected.should.eql ['ie 3', 'ie 2', 'chrome 3', 'chrome 2']

  describe 'prefixes()', ->

    it 'should return all prefixes', ->
      browsers = new Browsers(data)
      browsers.prefixes().should.eql ['-webkit-', '-ms-', '-o-']

  describe 'prefix()', ->

    it 'should return browser prefix', ->
      browsers = new Browsers(data)
      browsers.prefix('chrome 3').should == '-webkit-'

    it 'should return webkit prefix for Opera 15', ->
      browsers = new Browsers(data)
      browsers.prefix('opera 4').should  == '-o-'
      browsers.prefix('opera 15').should == '-webkit-'

  describe 'isSelected()', ->

    it 'should return true for selected browsers', ->
      browsers = new Browsers(data, ['chrome 3', 'chrome 2'])
      browsers.isSelected('chrome 2').should.be.true
      browsers.isSelected('ie 2').should.be.false
