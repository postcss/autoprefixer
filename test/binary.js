import Binary from '../binary';

import { expect } from 'chai';
import child      from 'child_process';
import parse      from 'postcss/lib/parse';
import path       from 'path';
import fs         from 'fs-extra';

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
        if ( event === 'data' && this.resumed ) {
            callback(this.content);
        } else if ( event === 'end' ) {
            callback();
        }
    }
}

let tempDir = path.join(__dirname, 'fixtures');

let temp = function (file) {
    return path.join(tempDir, file);
};

let write = function (file, content) {
    if ( !fs.existsSync(tempDir) ) fs.mkdirSync(tempDir);
    fs.outputFileSync(temp(file), content);
};

let read = function (file) {
    return fs.readFileSync(temp(file)).toString();
};

let readMap = function (file) {
    return parse(read(file)).prevMap.consumer();
};

let exists = function (file) {
    return fs.existsSync(temp(file));
};

let css      = 'a { transition: all 1s }';
let prefixed = 'a { -webkit-transition: all 1s; transition: all 1s }';

let stdout, stderr, stdin;


let exec = (...args) => {
    let callback = args.pop();
    args = args.map( (arg) => {
        if ( arg.match(/\.css/) || arg.match(/\/$/) ) {
            return temp(arg);
        } else {
            return arg;
        }
    });

    let binary = new Binary({
        argv:   ['', ''].concat(args),
        stdin:  stdin,
        stdout: stdout,
        stderr: stderr
    });

    binary.run( () => {
        let error;
        if ( binary.status === 0 && stderr.content === '' ) {
            error = false;
        } else {
            error = stderr.content;
        }
        callback(stdout.content, error);
    });
};

let run = (...args) => {
    let callback = args.pop();
    args.push(function (out, err) {
        expect(err).to.be.false;
        callback(out);
    });
    exec(...args);
};

let raise = (...args) => {
    let done  = args.pop();
    let error = args.pop();
    args.push(function (out, err) {
        expect(out).to.be.empty;
        expect(err).to.match(error);
        done();
    });
    exec(...args);
};

describe('Binary', () => {
    beforeEach( () => {
        stdout = new StringBuffer();
        stderr = new StringBuffer();
        stdin  = new StringBuffer();
    });

    afterEach( () => {
        if ( fs.existsSync(tempDir) ) fs.removeSync(tempDir);
    });

    it('shows autoprefixer version', (done) => {
        run('-v', (out) => {
            expect(out).to.match(/^autoprefixer [\d\.]+\n$/);
            done();
        });
    });

    it('shows help instructions', (done) => {
        run('-h', (out) => {
            expect(out).to.match(/Usage:/);
            done();
        });
    });

    it('shows selected browsers and properties', (done) => {
        run('-i', (out) => {
            expect(out).to.match(/Browsers:/);
            done();
        });
    });

    it('changes browsers', (done) => {
        run('-i', '-b', 'ie 6', (out) => {
            expect(out).to.match(/IE: 6/);
            done();
        });
    });

    it('cleans styles', (done) => {
        write('a.css', prefixed);
        run('-c', 'a.css', (out) => {
            expect(out).to.be.empty;
            expect(read('a.css')).to.eql(css);
            done();
        });
    });

    it('rewrites several files', (done) => {
        write('a.css', css);
        write('b.css', css + css);
        run('-b', 'chrome 25', 'a.css', 'b.css', (out) => {
            expect(out).to.be.empty;
            expect(read('a.css')).to.eql(prefixed);
            expect(read('b.css')).to.eql(prefixed + prefixed);
            done();
        });
    });

    it('changes output file', (done) => {
        write('a.css', css);
        run('-b', 'chrome 25', 'a.css', '-o', 'b.css', (out) => {
            expect(out).to.be.empty;
            expect(read('a.css')).to.eql(css);
            expect(read('b.css')).to.eql(prefixed);
            done();
        });
    });

    it('creates dirs for output file', (done) => {
        write('a.css', '');
        run('a.css', '-o', 'one/two/b.css', (out) => {
            expect(out).to.be.empty;
            expect(read('one/two/b.css')).to.be.empty;
            done();
        });
    });

    it('outputs to dir', (done) => {
        write('a.css', css);
        write('b.css', css + css);

        run('-b', 'chrome 25', 'a.css', 'b.css', '-d', 'out/', (out) => {
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
        run('-b', 'chrome 25', '-o', '-', 'a.css', (out) => {
            expect(out).to.eql(prefixed + '\n');
            expect(read('a.css')).to.eql(css);
            done();
        });
    });

    it('reads from stdin', (done) => {
        stdin.content = css;
        run('-b', 'chrome 25', (out) => {
            expect(out).to.eql(prefixed + '\n');
            done();
        });
    });

    it('skip source map by default', (done) => {
        write('a.css', css);
        run('-o', 'b.css', 'a.css', () => {
            expect(exists('b.css.map')).to.be.false;
            done();
        });
    });

    it('inline source map on -m argument', (done) => {
        write('a.css', css);
        run('-m', '-o', 'b.css', 'a.css', () => {
            expect(read('b.css')).to.match(/\n\/\*# sourceMappingURL=/);
            expect(exists('b.css.map')).to.be.false;

            let map = readMap('b.css');
            expect(map.file).to.eql('b.css');
            expect(map.sources).to.eql(['a.css']);

            done();
        });
    });

    it('generates separated source map file', (done) => {
        write('a.css', css);
        run('--no-inline-map', '-o', 'b.css', 'a.css', () => {
            expect(exists('b.css.map')).to.be.true;
            done();
        });
    });

    it('modify source map', (done) => {
        write('a.css', css);
        run('-m', '-o', 'b.css', 'a.css', () => {
            run('-o', 'c.css', 'b.css', () => {
                let map = readMap('c.css');
                expect(map.file).to.eql('c.css');
                expect(map.sources).to.eql(['a.css']);
                done();
            });
        });
    });

    it('forces map inline on request', (done) => {
        write('a.css', css);
        run('--no-inline-map', '-o', 'b.css', 'a.css', () => {
            run('-I', '-o', 'c.css', 'b.css', () => {
                expect(read('c.css')).to.match(/sourceMappingURL=/);
                expect(exists('c.css.map')).to.be.false;
                done();
            });
        });
    });

    it('ignore previous source map on request', (done) => {
        write('a.css', css);
        run('-m', '-o', 'b.css', 'a.css', () => {
            run('--no-map', '-o', 'c.css', 'b.css', () => {
                expect(read('c.css')).to.not.match(/sourceMappingURL=/);
                done();
            });
        });
    });

    it('uses cascade by default', (done) => {
        write('a.css', 'a {\n' +
                       '  transition: 1s }');
        run('-b', 'chrome 25', 'a.css', () => {
            expect(read('a.css')).to.eql('a {\n' +
                                         '  -webkit-transition: 1s;\n' +
                                         '          transition: 1s }');
            done();
        });
    });

    it('disables cascade by request', (done) => {
        write('a.css', 'a {\n' +
                       '  transition: 1s }');
        run('-b', 'chrome 25', '--no-cascade', 'a.css', () => {
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
        run('-b', 'chrome 38', 'a.css', () => {
            expect(read('a.css')).to.eql('a {\n' +
                                         '  transition: 1s }');
            done();
        });
    });

    it('keeps old prefixes by request', (done) => {
        write('a.css', 'a {\n' +
                       '  -webkit-transition: 1s;\n' +
                       '          transition: 1s }');
        run('-b', 'chrome 38', '--no-remove', 'a.css', () => {
            expect(read('a.css')).to.eql('a {\n' +
                                         '  -webkit-transition: 1s;\n' +
                                         '          transition: 1s }');
            done();
        });
    });

    it('changes annotation', (done) => {
        write('a/a.css', css);
        run('--annotation', '../a.map', 'a/a.css', () => {
            expect(read('a/a.css')).to.match(/sourceMappingURL=..\/a.map/);
            expect(exists('a.map')).to.be.true;
            done();
        });
    });

    it('skips annotation on request', (done) => {
        write('a.css', css);
        run('-m', '--no-map-annotation', '-o', 'b.css', 'a.css', () => {
            expect(read('b.css')).to.not.match(/sourceMappingURL=/);
            expect(exists('b.css.map')).to.be.true;
            done();
        });
    });

    it('includes sources content', (done) => {
        write('a.css', css);
        run('-m', 'a.css', () => {
            expect(readMap('a.css').sourcesContent).to.be.instanceof(Array);
            done();
        });
    });

    it('misses sources content on request', (done) => {
        write('a.css', css);
        run('--no-sources-content', 'a.css', () => {
            expect(readMap('a.css').sourcesContent).to.not.exist;
            done();
        });
    });

    it('forces sources content on request', (done) => {
        write('a.css', css);
        run('--no-sources-content', '-o', 'b.css', 'a.css', () => {
            run('--sources-content', '-o', 'c.css', 'b.css', () => {
                expect(readMap('c.css').sourcesContent).to.be.instanceof(Array);
                done();
            });
        });
    });

    it("raises an error when files doesn't exists", (done) => {
        raise('not.css', /doesn't exists/, done);
    });

    it('raises on several inputs and one output file', (done) => {
        write('a.css', css);
        write('b.css', css);
        raise('a.css', 'b.css', '-o', 'c.css',
              /For several files you can specify only output dir/, done);
    });

    it('raises on STDIN and output dir', (done) => {
        raise('-d', 'out/',
              /For STDIN input you need to specify output file/, done);
    });

    it('raises file in output dir', (done) => {
        write('b.css', '');
        raise('a.css', '-d', 'b.css', /is a file, not directory/, done);
    });

    it('raises an error when unknown arguments are given', (done) => {
        raise('-x', /autoprefixer: Unknown argument -x/, done);
    });

    it('prints errors', (done) => {
        raise('-b', 'ie', /autoprefixer: Unknown browser query `ie`/, done);
    });

    it('prints parsing errors', (done) => {
        stdin.content = 'a {';
        raise(/^autoprefixer:<css input>:1:1: [\s\S]+a \{/, done);
    });

    it('fixes parsing errors in safe mode', (done) => {
        write('a.css', 'a {');
        run('--safe', 'a.css', () => {
            expect(read('a.css')).to.eql('a {}');
            done();
        });
    });

    it('prints warnings', (done) => {
        write('a.css', 'a{background:linear-gradient(top,white,black)}');
        raise('a.css', /1:3: Gradient/, done);
    });

});

describe('autoprefixer', () => {

    it('is a module', () => {
        let autoprefixer = require('../');
        let name = autoprefixer({ browsers: 'chrome 25' }).postcssPlugin;
        expect(name).to.eql('autoprefixer');
    });

});

describe('bin/autoprefixer', () => {

    it('is an executable', (done) => {
        let binary = path.join(__dirname, '../autoprefixer');
        child.execFile(binary, ['-v'], { }, (error, out) => {
            expect(error).to.not.exist;
            expect(out).to.match(/^autoprefixer [\d\.]+\n$/);
            done();
        });
    });

});
