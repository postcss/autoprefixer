autoprefixer = require('../lib/autoprefixer')
Binary       = require('../lib/binary')

fs    = require('fs-extra')
child = require('child_process')

class StringBuffer
  constructor: -> @content  = ''
  write: (str) -> @content += str
  resume:      -> @resumed  = true
  on: (event, callback) ->
    if event == 'data' and @resumed
      callback(@content)
    else if event == 'end'
      callback()

tempDir = __dirname + '/fixtures'

write = (file, css) ->
  fs.mkdirSync(tempDir) unless fs.existsSync(tempDir)
  fs.writeFileSync("#{tempDir}/#{file}", css)

read = (file) ->
  fs.readFileSync("#{tempDir}/#{file}").toString()

describe 'Binary', ->
  beforeEach ->
    @stdout = new StringBuffer()
    @stderr = new StringBuffer()
    @stdin  = new StringBuffer()

    @exec = (args..., callback) ->
      args = args.map (i) ->
        if i.match(/\.css/) or i.match(/\/$/)
          "#{tempDir}/#{i}"
        else
          i

      binary = new Binary
        argv:   ['', ''].concat(args)
        stdin:  @stdin
        stdout: @stdout
        stderr: @stderr

      binary.run =>
        if binary.status == 0 and @stderr.content == ''
          error = false
        else
          error = @stderr.content
        callback(@stdout.content, error)

    @run = (args..., callback) ->
      @exec args..., (out, err) ->
        err.should.be.false
        callback(out)

    @raise = (args..., error, done) ->
      @exec args..., (out, err) ->
        out.should.be.empty
        err.should.match(error)
        done()

  afterEach ->
    fs.removeSync(tempDir) if fs.existsSync(tempDir)

  css      = 'a { transition: all 1s }'
  prefixed = "a { -webkit-transition: all 1s; transition: all 1s }"

  it 'shows autoprefixer version', (done) ->
    @run '-v', (out) ->
      out.should.match(/^autoprefixer [\d\.]+\n$/)
      done()

  it 'shows help instructions', (done) ->
    @run '-h', (out) ->
      out.should.match(/Usage:/)
      done()

  it 'shows selected browsers and properties', (done) ->
    @run '-i', (out) ->
      out.should.match(/Browsers:/)
      done()

  it 'changes browsers', (done) ->
    @run '-i', '-b', 'ie 6', (out) ->
      out.should.match(/IE: 6/)
      done()

  it 'rewrites several files', (done) ->
    write('a.css', css)
    write('b.css', css + css)
    @run '-b', 'chrome 25', 'a.css', 'b.css', (out) ->
      out.should.eql ''
      read('a.css').should.eql prefixed
      read('b.css').should.eql prefixed + prefixed
      done()

  it 'changes output file', (done) ->
    write('a.css', css)
    @run '-b', 'chrome 25', 'a.css', '-o', 'b.css', (out) ->
      out.should.eql ''
      read('a.css').should.eql css
      read('b.css').should.eql prefixed
      done()

  it 'creates dirs for output file', (done) ->
    write('a.css', '')
    @run 'a.css', '-o', 'one/two/b.css', (out) ->
      out.should.eql ''
      read('one/two/b.css').should.eql ''
      done()

  it 'outputs to dir', (done) ->
    write('a.css', css)
    write('b.css', css + css)

    @run '-b', 'chrome 25', 'a.css', 'b.css', '-d', 'out/', (out) ->
      out.should.eql ''

      read('a.css').should.eql css
      read('b.css').should.eql css + css
      read('out/a.css').should.eql prefixed
      read('out/b.css').should.eql prefixed + prefixed

      done()

  it 'outputs to stdout', (done) ->
    write('a.css', css)
    @run '-b', 'chrome 25', '-o', '-', 'a.css', (out) ->
      out.should.eql prefixed + "\n"
      read('a.css').should.eql css
      done()

  it 'reads from stdin', (done) ->
    @stdin.content = css
    @run '-b', 'chrome 25', (out) ->
      out.should.eql prefixed + "\n"
      done()

  it "raises an error when files doesn't exists", (done) ->
    @raise('not.css',
           /doesn't exists/, done)

  it 'raises on several inputs and one output file', (done) ->
    write('a.css', css)
    write('b.css', css)
    @raise('a.css', 'b.css', '-o', 'c.css',
           /For several files you can specify only output dir/, done)

  it 'raises on STDIN and output dir', (done) ->
    @raise('-d', 'out/',
           /For STDIN input you need to specify output file/, done)

  it 'raises file in output dir', (done) ->
    write('b.css', '')
    @raise('a.css', '-d', 'b.css',
           /is a file, not directory/, done)

  it 'raises an error when unknown arguments are given', (done) ->
    @raise('-x',
           /autoprefixer: Unknown argument -x/, done)

  it 'prints errors', (done) ->
    @raise('-b', 'ie',
           /autoprefixer: Unknown browser requirement `ie`/, done)

  it 'prints parsing errors', (done) ->
    @stdin.content = 'a {'
    @raise(/^autoprefixer: Can't parse CSS/, done)

describe 'bin/autoprefixer', ->

  it 'is an executable', (done) ->
    binary = __dirname + '/../bin/autoprefixer'
    child.execFile binary, ['-v'], { }, (error, out) ->
      (!!error).should.be.false
      out.should.match(/^autoprefixer [\d\.]+\n$/)
      done()
