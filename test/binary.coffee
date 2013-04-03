fs     = require('fs')
child  = require('child_process')
should = require('chai').should()

exec = (args..., callback) ->
  opts = if typeof(args[args.length - 1]) == 'object' then args.pop() else {}
  child.execFile 'bin/autoprefixer', args, opts, (error, out, err) ->
    should.not.exist(error)
    callback(out)

input = (file, css) ->
  fs.mkdirSync('test/fixtures') unless fs.existsSync('test/fixtures')
  fs.writeFileSync("test/fixtures/#{file}", css)

trim = (str) -> str.replace(/\s+/g, ' ')

read = (file) ->
  trim fs.readFileSync("test/fixtures/#{file}").toString()

css = 'a { transition: 1s }'

describe 'binary', ->

  afterEach ->
    if fs.existsSync('test/fixtures')
      files = fs.readdirSync('test/fixtures/')
      fs.unlinkSync("test/fixtures/#{file}") for file in files
      fs.rmdirSync('test/fixtures')

  it 'should show version', (done) ->
    exec '-v', (out) ->
      out.should.match(/^autoprefixer [\d\.]+\n$/)
      done()

  it 'should show help', (done) ->
    exec '-h', (out) ->
      out.should.match(/^Usage: /)
      done()

  it 'should use 2 last browsers by default', (done) ->
    input 'a', css
    exec 'test/fixtures/a', (out) ->
      out.should.eql('')
      read('a').should.eql('a { -webkit-transition: 1s; ' +
                               '-o-transition: 1s; transition: 1s }')
      done()

  it 'should change browsers', (done) ->
    input 'a', css
    exec 'test/fixtures/a', '--browsers', 'chrome 25, ff 15', ->
      read('a').should.eql('a { -webkit-transition: 1s; ' +
                               '-moz-transition: 1s; transition: 1s }')
      done()

  it 'should rewrite several files', (done) ->
    input 'a', css
    input 'b', 'b { transition: 1s }'
    exec 'test/fixtures/a', 'test/fixtures/b', '-b', 'chrome 25', ->
      read('a').should.eql('a { -webkit-transition: 1s; transition: 1s }')
      read('b').should.eql('b { -webkit-transition: 1s; transition: 1s }')
      done()

  it 'should change output file', (done) ->
    input 'a', css
    exec 'test/fixtures/a', '-o', 'test/fixtures/b', '-b', 'chrome 25', ->
      read('a').should.eql('a { transition: 1s }')
      read('b').should.eql('a { -webkit-transition: 1s; transition: 1s }')
      done()

  it 'should output to stdout', (done) ->
    input 'a', css
    exec 'test/fixtures/a', '-o', '-', '-b', 'chrome 25', (out) ->
      read('a').should.eql('a { transition: 1s }')
      trim(out).should.eql('a { -webkit-transition: 1s; transition: 1s } ')
      done()

  it 'should read from stdin', (done) ->
    child.exec "echo '#{css}' | bin/autoprefixer -b 'chrome 25'", (_, out) ->
      trim(out).should.eql('a { -webkit-transition: 1s; transition: 1s } ')
      done()

  it 'should inspect', (done) ->
    exec '-i', (out) ->
      out.should.match(/^Browsers:/)
      done()
