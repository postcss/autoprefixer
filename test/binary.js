var autoprefixer = require('../');
var Binary       = require('../binary');

var fs    = require('fs-extra');
var parse = require('postcss/lib/parse');
var child = require('child_process');

class StringBuffer {
    constructor() {
        this.content = '';
    }

    write(str) {
        this.content += str;
    }

    resume() {
        this.resumed = true;
    }

    on(event, callback) {
      if ( event == 'data' && this.resumed ) {
          callback(this.content);
      } else if ( event == 'end' ) {
          callback();
      }
    }
}

var tempDir = __dirname + '/fixtures';

var path = function (file) {
    return tempDir + '/' + file;
};

var write = function (file, css) {
    if ( !fs.existsSync(tempDir) ) fs.mkdirSync(tempDir);
    fs.outputFileSync(path(file), css);
};

var read = function (file) {
    return fs.readFileSync(path(file)).toString();
};

var readMap = function (file) {
    return parse(read(file)).prevMap.consumer();
};

var css      = 'a { transition: all 1s }';
var prefixed = 'a { -webkit-transition: all 1s; transition: all 1s }';

describe('Binary', () => {
    before( () => {
        this.exec = (...args) => {
            var callback = args.pop();
            args = args.map( (arg) => {
                if ( arg.match(/\.css/) || arg.match(/\/$/) ) {
                    return path(arg);
                } else {
                    return arg;
                }
            });

            var binary = new Binary({
                argv:   ['', ''].concat(args),
                stdin:  this.stdin,
                stdout: this.stdout,
                stderr: this.stderr
            });

            binary.run( () => {
                var error;
                if ( binary.status === 0 && this.stderr.content === '' ) {
                    error = false;
                } else {
                    error = this.stderr.content;
                }
                callback(this.stdout.content, error);
            });
        };

        this.run = (...args) => {
            var callback = args.pop();
            args.push(function (out, err) {
                err.should.be.false;
                callback(out);
            });
            this.exec(...args);
        };

        this.raise = (...args) => {
            var done  = args.pop();
            var error = args.pop();
            args.push(function (out, err) {
                out.should.be.empty;
                err.should.match(error);
                done();
            });
            this.exec(...args);
        };
    });

    beforeEach( () => {
        this.stdout = new StringBuffer();
        this.stderr = new StringBuffer();
        this.stdin  = new StringBuffer();
    });

    afterEach( () => {
        if ( fs.existsSync(tempDir) ) fs.removeSync(tempDir);
    });

    it('shows autoprefixer version', (done) => {
        this.run('-v', (out) => {
            out.should.match(/^autoprefixer [\d\.]+\n$/);
            done();
        });
    });

    it('shows help instructions', (done) => {
        this.run('-h', (out) => {
            out.should.match(/Usage:/);
            done();
        });
    });

    it('shows selected browsers and properties', (done) => {
        this.run('-i', (out) => {
            out.should.match(/Browsers:/);
            done();
        });
    });

    it('changes browsers', (done) => {
        this.run('-i', '-b', 'ie 6', (out) => {
            out.should.match(/IE: 6/);
            done();
        });
    });

    it('rewrites several files', (done) => {
        write('a.css', css);
        write('b.css', css + css);
        this.run('-b', 'chrome 25', 'a.css', 'b.css', (out) => {
            out.should.eql('');
            read('a.css').should.eql(prefixed);
            read('b.css').should.eql(prefixed + prefixed);
            done();
        });
    });

    it('changes output file', (done) => {
        write('a.css', css);
        this.run('-b', 'chrome 25', 'a.css', '-o', 'b.css', (out) => {
            out.should.eql('');
            read('a.css').should.eql(css);
            read('b.css').should.eql(prefixed);
            done();
        });
    });

    it('creates dirs for output file', (done) => {
        write('a.css', '');
        this.run('a.css', '-o', 'one/two/b.css', (out) => {
            out.should.eql('');
            read('one/two/b.css').should.eql('');
            done();
        });
    });

    it('outputs to dir', (done) => {
        write('a.css', css);
        write('b.css', css + css);

        this.run('-b', 'chrome 25', 'a.css', 'b.css', '-d', 'out/', (out) => {
            out.should.eql('');

            read('a.css').should.eql(css);
            read('b.css').should.eql(css + css);
            read('out/a.css').should.eql(prefixed);
            read('out/b.css').should.eql(prefixed + prefixed);

            done();
        });
    });

    it('outputs to stdout', (done) => {
        write('a.css', css);
        this.run('-b', 'chrome 25', '-o', '-', 'a.css', (out) => {
            out.should.eql(prefixed + "\n");
            read('a.css').should.eql(css);
            done();
        });
    });

    it('reads from stdin', (done) => {
        this.stdin.content = css;
        this.run('-b', 'chrome 25', (out) => {
            out.should.eql(prefixed + "\n");
            done();
        });
    });

    it('skip source map by default', (done) => {
        write('a.css', css);
        this.run('-o', 'b.css', 'a.css', () => {
            fs.existsSync( path('b.css.map') ).should.be.false;
            done();
        });
    });

    it('inline source map on -m argument', (done) => {
        write('a.css', css);
        this.run('-m', '-o', 'b.css', 'a.css', () => {
            read('b.css').should.match(/\n\/\*# sourceMappingURL=/);
            fs.existsSync( path('b.css.map') ).should.be.false;

            var map = readMap('b.css');
            map.file.should.eql('b.css');
            map.sources.should.eql(['a.css']);

            done();
        });
    });

    it('generates separated source map file', (done) => {
        write('a.css', css);
        this.run('--no-inline-map', '-o', 'b.css', 'a.css', () => {
            fs.existsSync( path('b.css.map') ).should.be.true;
            done();
        });
    });

    it('modify source map', (done) => {
        write('a.css', css);
        this.run('-m', '-o', 'b.css', 'a.css', () => {
            this.run('-o', 'c.css', 'b.css', () => {
                var map = readMap('c.css');
                map.file.should.eql('c.css');
                map.sources.should.eql(['a.css']);
                done();
            });
        });
    });

    it('forces map inline on request', (done) => {
        write('a.css', css);
        this.run('--no-inline-map', '-o', 'b.css', 'a.css', () => {
            this.run('-I', '-o', 'c.css', 'b.css', () => {
                read('c.css').should.match(/\n\/\*# sourceMappingURL=/);
                fs.existsSync( path('c.css.map') ).should.be.false;
                done();
            });
        });
    });

    it('ignore previous source map on request', (done) => {
        write('a.css', css);
        this.run('-m', '-o', 'b.css', 'a.css', () => {
            this.run('--no-map', '-o', 'c.css', 'b.css', () => {
                read('c.css').should.not.match(/\n\/\*# sourceMappingURL=/);
                done();
            });
        });
    });

    it('uses cascade by default', (done) => {
        write('a.css', 'a {\n' +
                       '  transition: 1s }');
        this.run('-b', 'chrome 25', 'a.css', () => {
            read('a.css').should.eql('a {\n' +
                                     '  -webkit-transition: 1s;\n' +
                                     '          transition: 1s }');
            done();
        });
    });

    it('disables cascade by request', (done) => {
        write('a.css', 'a {\n' +
                       '  transition: 1s }');
        this.run('-b', 'chrome 25', '--no-cascade', 'a.css', () => {
            read('a.css').should.eql('a {\n' +
                                     '  -webkit-transition: 1s;\n' +
                                     '  transition: 1s }');
            done();
        });
    });

    it('changes annotation', (done) => {
        write('a/a.css', css);
        this.run('--annotation', '../a.map', 'a/a.css', () => {
            read('a/a.css').should.match(/\n\/\*# sourceMappingURL=..\/a.map/);
            fs.existsSync( path('a.map') ).should.be.true;
            done();
        });
    });

    it('skips annotation on request', (done) => {
        write('a.css', css);
        this.run('-m', '--no-map-annotation', '-o', 'b.css', 'a.css', () => {
            read('b.css').should.not.match(/\n\/\*# sourceMappingURL=/);
            fs.existsSync( path('b.css.map') ).should.be.true;
            done();
        });
    });

    it('includes sources content', (done) => {
        write('a.css', css);
        this.run('-m', 'a.css', () => {
            (!!readMap('a.css').sourcesContent).should.be.true;
            done();
        });
    });

    it('misses sources content on request', (done) => {
        write('a.css', css);
        this.run('--no-sources-content', 'a.css', () => {
            (!!readMap('a.css').sourcesContent).should.be.false;
            done();
        });
    });

    it('forces sources content on request', (done) => {
        write('a.css', css);
        this.run('--no-sources-content', '-o', 'b.css', 'a.css', () => {
            this.run('--sources-content', '-o', 'c.css', 'b.css', () => {
                (!!readMap('c.css').sourcesContent).should.be.true;
                done();
            });
        });
    });

    it("raises an error when files doesn't exists", (done) => {
        this.raise('not.css',
                   /doesn't exists/, done);
    });

    it('raises on several inputs and one output file', (done) => {
        write('a.css', css);
        write('b.css', css);
        this.raise('a.css', 'b.css', '-o', 'c.css',
                   /For several files you can specify only output dir/, done);
    });

    it('raises on STDIN and output dir', (done) => {
        this.raise('-d', 'out/',
                   /For STDIN input you need to specify output file/, done);
    });

    it('raises file in output dir', (done) => {
        write('b.css', '');
        this.raise('a.css', '-d', 'b.css',
                   /is a file, not directory/, done);
    });

    it('raises an error when unknown arguments are given', (done) => {
        this.raise('-x',
                   /autoprefixer: Unknown argument -x/, done);
    });

    it('prints errors', (done) => {
        this.raise('-b', 'ie',
                   /autoprefixer: Unknown browser requirement `ie`/, done);
    });

    it('prints parsing errors', (done) => {
        this.stdin.content = 'a {';
        this.raise(/^autoprefixer:<css input>:1:1: [\s\S]+a \{/, done);
    });

    it('should not fix parsing errors in safe mode', (done) => {
        write('a.css', 'a {');
        this.run('--safe', 'a.css', () => {
            read('a.css').should.eql('a {}');
            done();
        });
    });

});

describe('bin/autoprefixer', () => {

    it('is an executable', (done) => {
        var binary = __dirname + '/../autoprefixer';
        child.execFile(binary, ['-v'], { }, (error, out) => {
            (!!error).should.be.false;
            out.should.match(/^autoprefixer [\d\.]+\n$/);
            done();
        });
    });

});

describe('autoprefixer', () => {

    it('is a module', () => {
        var autoprefixer = require('../');
        autoprefixer({ browsers: 'chrome 25' })
            .process(css).css.should.eql(prefixed);
    });

});
