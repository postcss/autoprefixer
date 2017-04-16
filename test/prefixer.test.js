const Prefixer = require('../lib/prefixer');
const parse    = require('postcss/lib/parse');

describe('Prefixer', () => {

    beforeEach(function () {
        this.prefix = new Prefixer();
        this.css = parse('@-ms-keyframes a { to { } } ' +
                         ':-moz-full-screen { } a { } ' +
                         '@-dev-keyframes s { to { } }');
    });

    describe('.hack()', () => {

        it('registers hacks for subclasses', () => {
            class A extends Prefixer {}
            class Hack extends A {
                static initClass() {
                    this.names = ['a', 'b'];
                }
            }

            Hack.initClass();
            A.hack(Hack);

            expect(A.hacks).toEqual({ a: Hack, b: Hack });
            expect(Prefixer.hacks).not.toBeDefined();
        });

    });

    describe('.load()', () => {

        it('loads hacks', () => {
            class A extends Prefixer {
                static initClass() {
                    this.prototype.klass = 'a';
                }
            }
            A.initClass();
            class Hack extends A {
                static initClass() {
                    this.prototype.klass = 'hack';
                }
            }
            Hack.initClass();
            A.hacks = { hacked: Hack };

            expect(A.load('hacked').klass).toEqual('hack');
            expect(A.load('a').klass).toEqual('a');
        });

    });

    describe('.clone()', () => {

        it('cleans custom properties', function () {
            const rule = this.css.first.first;
            rule._autoprefixerPrefix = '-ms-';
            rule._autoprefixerValues = { '-ms-': 1 };

            const cloned = Prefixer.clone(rule, { selector: 'from' });
            expect(cloned.selector).toEqual('from');

            expect(cloned._autoprefixerPrefix).not.toBeDefined();
            expect(cloned._autoprefixerValues).not.toBeDefined();
        });

        it('fixed declaration between', () => {
            const css = parse('a { color : black }');
            const cloned = Prefixer.clone(css.first.first);
            expect(cloned.raws.between).toEqual(' : ');
        });
    });

    describe('parentPrefix', () => {

        it('works with root node', function () {
            expect(this.prefix.parentPrefix(this.css)).toBeFalsy();
        });

        it('finds in at-rules', function () {
            expect(this.prefix.parentPrefix(this.css.first)).toEqual('-ms-');
        });

        it('finds in selectors', function () {
            let rule = this.css.nodes[1];
            expect(this.prefix.parentPrefix(rule)).toEqual('-moz-');
        });

        it('finds in parents', function () {
            let decl = this.css.first.first;
            expect(this.prefix.parentPrefix(decl)).toEqual('-ms-');
            expect(this.prefix.parentPrefix(this.css.nodes[2])).toBeFalsy();
        });

        it('caches prefix', function () {
            this.prefix.parentPrefix(this.css.first);
            expect(this.css.first._autoprefixerPrefix).toEqual('-ms-');

            this.css.first._autoprefixerPrefix = false;
            expect(this.prefix.parentPrefix(this.css.first)).toBeFalsy();
        });

        it('finds only browsers prefixes', function () {
            expect(this.prefix.parentPrefix(this.css.nodes[2])).toBeFalsy();
        });

        it('works with selector contained --', function () {
            const css = parse(':--a { color: black }');
            expect(this.prefix.parentPrefix(css.first.first)).toBeFalsy();
        });
    });
});
