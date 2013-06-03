fs     = require('fs')
child  = require('child_process')
should = require('should')

exec = (args, callback) ->
  opts = if typeof(args[args.length - 1]) == 'object' then args.pop() else {}
  child.execFile('bin/autoprefixer', args, opts, callback)

bin = (args..., callback) ->
  exec args, (error, out, err) ->
    should.not.exist(error)
    callback(out)

error = (args..., callback) ->
  exec args, (error, out, err) ->
    should.exist(error)
    callback(err)

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
    bin '-v', (out) ->
      out.should.match(/^autoprefixer [\d\.]+\n$/)
      done()

  it 'should show help', (done) ->
    bin '-h', (out) ->
      out.should.match(/^Usage: /)
      done()

  it 'should use 2 last browsers by default', (done) ->
    input 'a', css
    bin 'test/fixtures/a', (out) ->
      out.should.eql('')
      read('a').should.eql('a { -webkit-transition: 1s; ' +
                               '-o-transition: 1s; transition: 1s; }')
      done()

  it 'should change browsers', (done) ->
    input 'a', css
    bin 'test/fixtures/a', '--browsers', 'chrome 25, ff 15', ->
      read('a').should.eql('a { -webkit-transition: 1s; ' +
                               '-moz-transition: 1s; transition: 1s; }')
      done()

  it 'should rewrite several files', (done) ->
    input 'a', css
    input 'b', 'b { transition: 1s }'
    bin 'test/fixtures/a', 'test/fixtures/b', '-b', 'chrome 25', ->
      read('a').should.eql('a { -webkit-transition: 1s; transition: 1s; }')
      read('b').should.eql('b { -webkit-transition: 1s; transition: 1s; }')
      done()

  it 'should change output file', (done) ->
    input 'a', css
    bin 'test/fixtures/a', '-o', 'test/fixtures/b', '-b', 'chrome 25', ->
      read('a').should.eql('a { transition: 1s }')
      read('b').should.eql('a { -webkit-transition: 1s; transition: 1s; }')
      done()

  it 'should output to stdout', (done) ->
    input 'a', css
    bin 'test/fixtures/a', '-o', '-', '-b', 'chrome 25', (out) ->
      read('a').should.eql('a { transition: 1s }')
      trim(out).should.eql('a { -webkit-transition: 1s; transition: 1s; } ')
      done()

  it 'should read from stdin', (done) ->
    child.exec "echo '#{css}' | bin/autoprefixer -b 'chrome 25'", (_, out) ->
      trim(out).should.eql('a { -webkit-transition: 1s; transition: 1s; } ')
      done()

  it 'should inspect', (done) ->
    bin '-i', (out) ->
      out.should.match(/^Browsers:/)
      done()

  it "should raise error, when files isn't exists", (done) ->
    error 'test/fixtures/a', (err) ->
      err.should.eql("autoprefixer: File 'test/fixtures/a' doesn't exists\n")
      done()

  it 'should raise error on unknown argumnets', (done) ->
    error '-x', (err) ->
      err.should.eql("autoprefixer: Unknown argument -x\n")
      done()

  it 'should nice print errors', (done) ->
    input 'a', css
    error 'test/fixtures/a', '-b', 'ie', (err) ->
      err.should.eql("autoprefixer: Can't recognize version in `ie`\n")
      done()
