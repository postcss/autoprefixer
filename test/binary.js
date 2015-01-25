var autoprefixer = require('../');
var Binary       = require('../binary');

var fs     = require('fs-extra');
var parse  = require('postcss/lib/parse');
var child  = require('child_process');
var expect = require('chai').expect;

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

var exists = function (file) {
    return fs.existsSync(path(file));
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
                expect(err).to.be.false;
                callback(out);
            });
            this.exec(...args);
        };

        this.raise = (...args) => {
            var done  = args.pop();
            var error = args.pop();
            args.push(function (out, err) {
                expect(out).to.be.empty;
                expect(err).to.match(error);
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
            expect(out).to.match(/^autoprefixer [\d\.]+\n$/);
            done();
        });
    });

    it('shows help instructions', (done) => {
        this.run('-h', (out) => {
            expect(out).to.match(/Usage:/);
            done();
        });
    });

    it('shows selected browsers and properties', (done) => {
        this.run('-i', (out) => {
            expect(out).to.match(/Browsers:/);
            done();
        });
    });

    it('changes browsers', (done) => {
        this.run('-i', '-b', 'ie 6', (out) => {
            expect(out).to.match(/IE: 6/);
            done();
        });
    });

    it('cleans styles', (done) => {
        write('a.css', prefixed);
        this.run('-c', 'a.css', (out) => {
            expect(out).to.be.empty;
            expect(read('a.css')).to.eql(css);
            done();
        });
    });

    it('rewrites several files', (done) => {
        write('a.css', css);
        write('b.css', css + css);
        this.run('-b', 'chrome 25', 'a.css', 'b.css', (out) => {
            expect(out).to.be.empty;
            expect(read('a.css')).to.eql(prefixed);
            expect(read('b.css')).to.eql(prefixed + prefixed);
            done();
        });
    });

    it('changes output file', (done) => {
        write('a.css', css);
        this.run('-b', 'chrome 25', 'a.css', '-o', 'b.css', (out) => {
            expect(out).to.be.empty;
            expect(read('a.css')).to.eql(css);
            expect(read('b.css')).to.eql(prefixed);
            done();
        });
    });

    it('creates dirs for output file', (done) => {
        write('a.css', '');
        this.run('a.css', '-o', 'one/two/b.css', (out) => {
            expect(out).to.be.empty;
            expect(read('one/two/b.css')).to.be.empty;
            done();
        });
    });

    it('outputs to dir', (done) => {
        write('a.css', css);
        write('b.css', css + css);

        this.run('-b', 'chrome 25', 'a.css', 'b.css', '-d', 'out/', (out) => {
            expect(out).to.be.empty;

            expect(read('a.css')).to.eql(css);
            expect(read('b.css')).to.eql(css + css);
            expect(read('out/a.css')).to.eql(prefixed);
            expect(read('out/b.css')).to.eql(prefixed + prefixed);

            done();
        });
    });

    it('outputs to stdout', (done) => {
        write('a.css', css);
        this.run('-b', 'chrome 25', '-o', '-', 'a.css', (out) => {
            expect(out).to.eql(prefixed + "\n");
            expect(read('a.css')).to.eql(css);
            done();
        });
    });

    it('reads from stdin', (done) => {
        this.stdin.content = css;
        this.run('-b', 'chrome 25', (out) => {
            expect(out).to.eql(prefixed + "\n");
            done();
        });
    });

    it('skip source map by default', (done) => {
        write('a.css', css);
        this.run('-o', 'b.css', 'a.css', () => {
            expect(exists('b.css.map')).to.be.false;
            done();
        });
    });

    it('inline source map on -m argument', (done) => {
        write('a.css', css);
        this.run('-m', '-o', 'b.css', 'a.css', () => {
            expect(read('b.css')).to.match(/\n\/\*# sourceMappingURL=/);
            expect(exists('b.css.map')).to.be.false;

            var map = readMap('b.css');
            expect(map.file).to.eql('b.css');
            expect(map.sources).to.eql(['a.css']);

            done();
        });
    });

    it('generates separated source map file', (done) => {
        write('a.css', css);
        this.run('--no-inline-map', '-o', 'b.css', 'a.css', () => {
            expect(exists('b.css.map')).to.be.true;
            done();
        });
    });

    it('modify source map', (done) => {
        write('a.css', css);
        this.run('-m', '-o', 'b.css', 'a.css', () => {
            this.run('-o', 'c.css', 'b.css', () => {
                var map = readMap('c.css');
                expect(map.file).to.eql('c.css');
                expect(map.sources).to.eql(['a.css']);
                done();
            });
        });
    });

    it('forces map inline on request', (done) => {
        write('a.css', css);
        this.run('--no-inline-map', '-o', 'b.css', 'a.css', () => {
            this.run('-I', '-o', 'c.css', 'b.css', () => {
                expect(read('c.css')).to.match(/sourceMappingURL=/);
                expect(exists('c.css.map')).to.be.false;
                done();
            });
        });
    });

    it('ignore previous source map on request', (done) => {
        write('a.css', css);
        this.run('-m', '-o', 'b.css', 'a.css', () => {
            this.run('--no-map', '-o', 'c.css', 'b.css', () => {
                expect(read('c.css')).to.not.match(/sourceMappingURL=/);
                done();
            });
        });
    });

    it('uses cascade by default', (done) => {
        write('a.css', 'a {\n' +
                       '  transition: 1s }');
        this.run('-b', 'chrome 25', 'a.css', () => {
            expect(read('a.css')).to.eql('a {\n' +
                                         '  -webkit-transition: 1s;\n' +
                                         '          transition: 1s }');
            done();
        });
    });

    it('disables cascade by request', (done) => {
        write('a.css', 'a {\n' +
                       '  transition: 1s }');
        this.run('-b', 'chrome 25', '--no-cascade', 'a.css', () => {
            expect(read('a.css')).to.eql('a {\n' +
                                         '  -webkit-transition: 1s;\n' +
                                         '  transition: 1s }');
            done();
        });
    });

    it('removes old prefixes by default', (done) => {
        write('a.css', 'a {\n' +
                       '  -webkit-transition: 1s;\n' +
                       '          transition: 1s }');
        this.run('-b', 'chrome 38', 'a.css', () => {
            expect(read('a.css')).to.eql('a {\n' +
                                         '  transition: 1s }');
            done();
        });
    });

    it('keeps old prefixes by request', (done) => {
        write('a.css', 'a {\n' +
                       '  -webkit-transition: 1s;\n' +
                       '          transition: 1s }');
        this.run('-b', 'chrome 38', '--no-remove', 'a.css', () => {
            expect(read('a.css')).to.eql('a {\n' +
                                         '  -webkit-transition: 1s;\n' +
                                         '          transition: 1s }');
            done();
        });
    });

    it('changes annotation', (done) => {
        write('a/a.css', css);
        this.run('--annotation', '../a.map', 'a/a.css', () => {
            expect(read('a/a.css')).to.match(/sourceMappingURL=..\/a.map/);
            expect(exists('a.map')).to.be.true;
            done();
        });
    });

    it('skips annotation on request', (done) => {
        write('a.css', css);
        this.run('-m', '--no-map-annotation', '-o', 'b.css', 'a.css', () => {
            expect(read('b.css')).to.not.match(/sourceMappingURL=/);
            expect(exists('b.css.map')).to.be.true;
            done();
        });
    });

    it('includes sources content', (done) => {
        write('a.css', css);
        this.run('-m', 'a.css', () => {
            expect(readMap('a.css').sourcesContent).to.be.instanceof(Array);
            done();
        });
    });

    it('misses sources content on request', (done) => {
        write('a.css', css);
        this.run('--no-sources-content', 'a.css', () => {
            expect(readMap('a.css').sourcesContent).to.not.exist;
            done();
        });
    });

    it('forces sources content on request', (done) => {
        write('a.css', css);
        this.run('--no-sources-content', '-o', 'b.css', 'a.css', () => {
            this.run('--sources-content', '-o', 'c.css', 'b.css', () => {
                expect(readMap('c.css').sourcesContent).to.be.instanceof(Array);
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
                   /autoprefixer: Unknown browser query `ie`/, done);
    });

    it('prints parsing errors', (done) => {
        this.stdin.content = 'a {';
        this.raise(/^autoprefixer:<css input>:1:1: [\s\S]+a \{/, done);
    });

    it('fixes parsing errors in safe mode', (done) => {
        write('a.css', 'a {');
        this.run('--safe', 'a.css', () => {
            expect(read('a.css')).to.eql('a {}');
            done();
        });
    });

});

describe('bin/autoprefixer', () => {

    it('is an executable', (done) => {
        var binary = __dirname + '/../autoprefixer';
        child.execFile(binary, ['-v'], { }, (error, out) => {
            expect(error).to.not.exist;
            expect(out).to.match(/^autoprefixer [\d\.]+\n$/);
            done();
        });
    });

});

describe('autoprefixer', () => {

    it('is a module', () => {
        var autoprefixer = require('../');
        var result = autoprefixer({ browsers: 'chrome 25' }).process(css);
        expect(result.css).to.eql(prefixed);
    });

});
