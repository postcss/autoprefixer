import autoprefixer from 'autoprefixer-core';
import postcss      from 'postcss';
import path         from 'path';
import fs           from 'fs-extra';

export default class Binary {
    constructor(process) {
        this.arguments = process.argv.slice(2);
        this.stdin     = process.stdin;
        this.stderr    = process.stderr;
        this.stdout    = process.stdout;

        this.status     = 0;
        this.command    = 'compile';
        this.inputFiles = [];

        this.processOptions = { };
        this.pluginOptions  = { };
        this.parseArguments();
    }

    // Quick help message
    help() {
        return (
`Usage: autoprefixer [OPTION...] FILES

Parse CSS files and add prefixed properties and values.

Options:
  -b, --browsers BROWSERS  add prefixes for selected browsers
  -c, --clean              remove all known prefixes
  -o, --output FILE        set output file
  -d, --dir DIR            set output dir
  -m, --map                generate source map
      --no-map             skip source map even if previous map exists
      --no-inline-map      do not inline maps to data:uri
      --inline-map         force inline map
      --annotation PATH    change map location relative from CSS file
      --no-map-annotation  do not add source map annotation comment in CSS
      --no-sources-content remove origin CSS from maps
      --sources-content    force include origin CSS into map
      --no-cascade         do not create nice visual cascade of prefixes
      --no-remove          do not remove outdated prefixes
      --safe               try to fix CSS syntax errors
  -i, --info               show selected browsers and properties
  -h, --help               show help text
  -v, --version            print program version`);
    }

    // Options description
    desc() {
        return (
`Files:
  If you didn't set input files, autoprefixer will read from stdin stream.

  By default, prefixed CSS will rewrite original files.

  You can specify output file or directory by '-o' argument.
  For several input files you can specify only output directory by '-d'.

  Output CSS will be written to stdout stream on '-o -' argument or stdin input.

Source maps:
  On '-m' argument Autoprefixer will generate source map for changes near
  output CSS (for out/main.css it generates out/main.css.map).

  If previous source map will be near input files (for example, in/main.css
  and in/main.css.map) Autoprefixer will apply previous map to output
  source map.

Browsers:
  Separate browsers by comma. For example, '-b "> 1%, opera 12"'.
  You can set browsers by global usage statictics: '-b \"> 1%\"'.
  or last version: '-b "last 2 versions"'.`);
    }

    // Print to stdout
    print(str) {
        str = str.replace(/\n$/, '');
        this.stdout.write(str + '\n');
    }

    // Print to stdout
    error(str) {
        this.status = 1;
        this.stderr.write(str + '\n');
    }

    // Get current version
    version() {
        return require('./package.json').version;
    }

    // Parse arguments
    parseArguments() {
        let args = this.arguments.slice();
        while ( args.length > 0 ) {
            let arg = args.shift();

            if ( arg === '-h' || arg === '--help' ) {
                this.command = 'showHelp';

            } else if ( arg === '-v' || arg === '--version' ) {
                this.command = 'showVersion';

            } else if ( arg === '-i' || arg === '--info' ) {
                this.command = 'info';

            } else if ( arg === '-m' || arg === '--map' ) {
                this.processOptions.map = { };

            } else if ( arg === '--no-map' ) {
                this.processOptions.map = false;

            } else if ( arg === '-I' || arg === '--inline-map' ) {
                if ( typeof this.processOptions.map === 'undefined' ) {
                    this.processOptions.map = { };
                }
                this.processOptions.map.inline = true;

            } else if ( arg === '--no-inline-map' ) {
                if ( typeof this.processOptions.map === 'undefined' ) {
                    this.processOptions.map = { };
                }
                this.processOptions.map.inline = false;

            } else if ( arg === '--annotation' ) {
                if ( typeof this.processOptions.map === 'undefined' ) {
                    this.processOptions.map = { };
                }
                this.processOptions.map.annotation = args.shift();

            } else if ( arg === '--no-map-annotation' ) {
                if ( typeof this.processOptions.map === 'undefined' ) {
                    this.processOptions.map = { };
                }
                this.processOptions.map.annotation = false;

            } else if ( arg === '--sources-content' ) {
                if ( typeof this.processOptions.map === 'undefined' ) {
                    this.processOptions.map = { };
                }
                this.processOptions.map.sourcesContent = true;

            } else if ( arg === '--no-sources-content' ) {
                if ( typeof this.processOptions.map === 'undefined' ) {
                    this.processOptions.map = { };
                }
                this.processOptions.map.sourcesContent = false;

            } else if ( arg === '--no-cascade' ) {
                this.pluginOptions.cascade = false;

            } else if ( arg === '--no-remove' ) {
                this.pluginOptions.remove = false;

            } else if ( arg === '--safe' ) {
                this.processOptions.safe = true;

            } else if ( arg === '-b' || arg === '--browsers' ) {
                this.pluginOptions.browsers = args.shift().split(',')
                  .map( (i) => i.trim() );

            } else if ( arg === '-c' || arg === '--clean' ) {
                this.pluginOptions.browsers = [];

            } else if ( arg === '-o' || arg === '--output' ) {
                this.outputFile = args.shift();

            } else if ( arg === '-d' || arg === '--dir' ) {
                this.outputDir = args.shift();

            } else {
                if ( arg.match(/^-\w$/) || arg.match(/^--\w[\w-]+$/) ) {
                    this.command = undefined;

                    this.error('autoprefixer: Unknown argument ' + arg);
                    this.error('');
                    this.error(this.help());

                } else {
                    this.inputFiles.push(arg);
                }
            }
        }
    }

    // Print help
    showHelp(done) {
        this.print(this.help());
        this.print('');
        this.print(this.desc());
        done();
    }

    // Print version
    showVersion(done) {
        this.print('autoprefixer ' + this.version());
        done();
    }

    // Print inspect
    info(done) {
        this.print(autoprefixer(this.pluginOptions).info());
        done();
    }

    // Mark that there is another async work
    startWork() {
        this.waiting += 1;
    }

    // Execute done callback if there is no works
    endWork() {
        this.waiting -= 1;
        if ( this.waiting <= 0 ) this.doneCallback();
    }

    // Write error to stderr and finish work
    workError(str) {
        this.error(str);
        this.endWork();
    }

    // Lazy loading for Autoprefixer instance
    compiler() {
        if ( !this.compilerCache ) {
            this.compilerCache = postcss([ autoprefixer(this.pluginOptions) ]);
        }
        return this.compilerCache;
    }

    // Compile loaded CSS
    compileCSS(css, output, input) {
        let opts = { };
        for ( let name in this.processOptions ) {
            opts[name] = this.processOptions[name];
        }
        if ( input )          opts.from = input;
        if ( output !== '-' ) opts.to   = output;

        this.compiler().process(css, opts)
            .catch( (error) => {
                if ( error.indexOf && error.indexOf('Unknown browser') !== -1 ) {
                    this.error('autoprefixer: ' + error);
                } else if ( error.autoprefixer ) {
                    this.error('autoprefixer: ' + error.message);
                } else if ( error.name === 'CssSyntaxError' ) {
                    let text = error.message + error.showSourceCode();
                    this.error('autoprefixer:' + text);
                } else {
                    this.error('autoprefixer: Internal error');
                    if ( error.stack ) {
                        this.error('');
                        this.error(error.stack);
                    }
                }
                this.endWork();
            })
            .then( (result) => {
                result.warnings().forEach( (warn) => {
                    this.stderr.write(warn.toString() + '\n');
                });

                if ( output === '-' ) {
                    this.print(result.css);
                    this.endWork();
                } else {
                    fs.outputFile(output, result.css, (err1) => {
                        if ( err1 ) this.error('autoprefixer: ' + err1);

                        if ( result.map ) {
                            let map;
                            if ( opts.map && opts.map.annotation ) {
                                map = path.resolve(path.dirname(output),
                                                   opts.map.annotation);
                            } else {
                                map = output + '.map';
                            }
                            fs.writeFile(map, result.map, (err2) => {
                                if ( err2 ) this.error('autoprefixer: ' + err2);
                                this.endWork();
                            });
                        } else {
                            this.endWork();
                        }
                    });
                }
            });
    }

    // Return input and output files array
    files() {
        if ( this.inputFiles.length === 0 && !this.outputFile ) {
            this.outputFile = '-';
        }

        let file;
        let list = [];
        if ( this.outputDir ) {
            if ( this.inputFiles.length === 0 ) {
                this.error('autoprefixer: For STDIN input you need ' +
                           'to specify output file (by -o FILE),\n ' +
                           'not output dir');
                return false;
            }

            let dir = this.outputDir;
            if ( fs.existsSync(dir) && !fs.statSync(dir).isDirectory() ) {
                this.error('autoprefixer: Path ' + dir +
                           ' is a file, not directory');
                return false;
            }

            let output;
            for ( file of this.inputFiles ) {
                output = path.join(this.outputDir, path.basename(file));
                list.push([file, output]);
            }

        } else if ( this.outputFile ) {
            if ( this.inputFiles.length > 1 ) {
                this.error('autoprefixer: For several files you can ' +
                           'specify only output dir (by -d DIR`),\n' +
                           'not one output file');
                return false;
            }

            for ( file of this.inputFiles ) {
                list.push([file, this.outputFile]);
            }

        } else {
            for ( file of this.inputFiles ) {
                list.push([file, file]);
            }
        }

        return list;
    }

    // Compile selected files
    compile(done) {
        this.waiting      = 0;
        this.doneCallback = done;

        let files = this.files();
        if ( files === false ) return done();

        if ( files.length === 0 ) {
            this.startWork();

            let css = '';
            this.stdin.resume();
            this.stdin.on('data', (chunk) => css += chunk);
            this.stdin.on('end', () => {
                this.compileCSS(css, this.outputFile);
            });
        } else {
            let i, input, output;
            for ( i = 0; i < files.length; i++ ) {
                this.startWork();
            }
            for ( i = 0; i < files.length; i++ ) {
                [input, output] = files[i];

                if ( !fs.existsSync(input) ) {
                    this.workError('autoprefixer: File ' + input + ' ' +
                                   'doesn\'t exists');
                    continue;
                }

                ((input2, output2) => {
                    fs.readFile(input2, (error, css) => {
                        if ( error ) {
                            this.workError('autoprefixer: ' + error.message);
                        } else {
                            this.compileCSS(css, output2, input2);
                        }
                    });
                })(input, output);
            }
        }
    }

    // Execute command selected by arguments
    run(done) {
        if ( this.command ) {
            this[this.command](done);
        } else {
            done();
        }
    }
}
