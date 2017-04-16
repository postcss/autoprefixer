const OldValue = require('../lib/old-value');
const Value    = require('../lib//value');
const parse    = require('postcss/lib/parse');

const Prefixes = require('../lib/prefixes');
const prefixes = new Prefixes();

let calc;
beforeEach(() => {
    calc = new Value('calc', ['-moz-', '-ms-']);
});

describe('.save()', () => {

    it('clones declaration', () => {
        const css   = parse('a { prop: v }');
        const width = css.first.first;

        width._autoprefixerValues = { '-ms-': '-ms-v' };
        Value.save(prefixes, width);

        expect(css.toString()).toEqual('a { prop: -ms-v; prop: v }');
    });

    it('updates declaration with prefix', () => {
        const css   = parse('a { -ms-prop: v }');
        const width = css.first.first;

        width._autoprefixerValues = { '-ms-': '-ms-v' };
        Value.save(prefixes, width);

        expect(css.toString()).toEqual('a { -ms-prop: -ms-v }');
    });

    it('ignores on another prefix property', () => {
        const css   = parse('a { -ms-prop: v; prop: v }');
        const width = css.first.last;

        width._autoprefixerValues = { '-ms-': '-ms-v' };
        Value.save(prefixes, width);

        expect(css.toString()).toEqual('a { -ms-prop: v; prop: v }');
    });

    it('ignores prefixes without changes', () => {
        const css   = parse('a { prop: v }');
        const width = css.first.first;

        width._autoprefixerValues = { '-ms-': 'v' };
        Value.save(prefixes, width);

        expect(css.toString()).toEqual('a { prop: v }');
    });

});

describe('check()', () => {

    it('checks value in string', () => {
        const css = parse('a { 0: calc(1px + 1em); ' +
                          '1: 1px calc(1px + 1em); ' +
                          '2: (calc(1px + 1em)); ' +
                          '3: -ms-calc; ' +
                          '4: calced; }');

        expect(calc.check(css.first.nodes[0])).toBeTruthy();
        expect(calc.check(css.first.nodes[1])).toBeTruthy();
        expect(calc.check(css.first.nodes[2])).toBeTruthy();

        expect(calc.check(css.first.nodes[3])).toBeFalsy();
        expect(calc.check(css.first.nodes[4])).toBeFalsy();
    });

});

describe('old()', () => {

    it('check prefixed value', () => {
        expect(calc.old('-ms-')).toEqual(new OldValue('calc', '-ms-calc'));
    });

});

describe('replace()', () => {

    it('adds prefix to value', () => {
        expect(calc.replace('1px calc(1em)', '-ms-'))
            .toEqual('1px -ms-calc(1em)');
        expect(calc.replace('1px,calc(1em)', '-ms-'))
            .toEqual('1px,-ms-calc(1em)');
    });

});

describe('process()', () => {

    it('adds prefixes', () => {
        const css   = parse('a { width: calc(1em) calc(1%) }');
        const width = css.first.first;

        calc.process(width);
        expect(width._autoprefixerValues).toEqual({
            '-moz-': '-moz-calc(1em) -moz-calc(1%)',
            '-ms-':   '-ms-calc(1em) -ms-calc(1%)'
        });
    });

    it('checks parents prefix', () => {
        const css   = parse('::-moz-fullscreen a { width: calc(1%) }');
        const width = css.first.first;

        calc.process(width);
        expect(width._autoprefixerValues).toEqual({ '-moz-': '-moz-calc(1%)' });
    });

    it('checks property prefix', () => {
        const css = parse('a { -moz-width: calc(1%); -o-width: calc(1%) }');
        const decls = css.first.nodes;

        calc.process(decls[0]);
        expect(decls[0]._autoprefixerValues).toEqual({
            '-moz-': '-moz-calc(1%)'
        });

        calc.process(decls[1]);
        expect(decls[1]._autoprefixerValues).not.toBeDefined();
    });

});
