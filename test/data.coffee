autoprefixer = require('..')
read         = require('fs').readFileSync
css          = (name) -> read('test/css/' + name + '.css', 'utf8').trim()

last = ['chrome 26', 'ff 20', 'ie 10', 'ios 6', 'opera 12', 'safari 6']

describe 'autoprefixer data', ->

  it 'should add prefixes', ->
    autoprefixer.compile(css('data'), last).should.equal(css('data.out'))
