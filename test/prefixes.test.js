const Declaration = require('../lib/declaration');
const Prefixes    = require('../lib/prefixes');
const Browsers    = require('../lib/browsers');
const Supports    = require('../lib/supports');
const Selector    = require('../lib/selector');
const OldValue    = require('../lib/old-value');
const Value       = require('../lib/value');
const parse       = require('postcss/lib/parse');

const data = {
    browsers: require('caniuse-lite').agents,
    prefixes: {
        a: {
            browsers: ['firefox 21', 'firefox 20 old', 'chrome 30', 'ie 6']
        },
        b: {
            browsers: ['ie 7 new', 'firefox 20'],
            mistakes: ['-webkit-'],
            props:    ['a', '*']
        },
        c: {
            browsers: ['ie 7', 'firefox 20'],
            selector: true
        }
    }
};

const empty = new Prefixes({ }, new Browsers(data.browsers, []));
const fill  = new Prefixes(data.prefixes,
                     new Browsers(data.browsers, ['firefox 21', 'ie 7']));

const cSel  = new Selector('c', ['-ms-'], fill);
const bVal  = new Value('b', ['-ms- new'], fill);
const aProp = new Declaration('a', ['-moz-'], fill);
aProp.values = [bVal];

function old(prefixed) {
    const name = prefixed.replace(/-[^-]+-( old)?/, '');
    return new OldValue(name, prefixed);
}

describe('select()', () => {

    it('selects necessary prefixes', () => {
        expect(fill.select(data.prefixes)).toEqual({
            add: {
                a: ['-moz-'],
                b: ['-ms- new'],
                c: ['-ms-']
            },
            remove: {
                a: ['-webkit-', '-ms-', '-moz- old'],
                b: ['-ms-', '-moz-', '-webkit-'],
                c: ['-moz-']
            }
        });
    });

});

describe('preprocess()', () => {

    it('preprocesses prefixes add data', () => {
        expect(fill.add).toEqual({
            'selectors': [cSel],
            'a': aProp,
            '*': {
                values: [bVal]
            },
            '@supports': new Supports(Prefixes, fill)
        });
    });

    it('preprocesses prefixes remove data', () => {
        expect(JSON.stringify(fill.remove)).toEqual(JSON.stringify({
            'selectors': [cSel.old('-moz-')],
            '-webkit-a': {
                remove: true
            },
            '-ms-a': {
                remove: true
            },
            '-moz- olda': {
                remove: true
            },
            'a': {
                values: [old('-ms-b'), old('-moz-b'), old('-webkit-b')]
            },
            '*': {
                values: [old('-ms-b'), old('-moz-b'), old('-webkit-b')]
            }
        }));
    });

});

describe('.cleaner()', () => {

    it('returns itself is no browsers are selected', () => {
        expect(empty.cleaner()).toEqual(empty);
    });

    it('returns Prefixes with empty browsers', () => {
        const cleaner = new Prefixes(data.prefixes,
            new Browsers(data.browsers, []));
        expect(Object.keys(fill.cleaner().add).length).toEqual(2);
        expect(fill.cleaner().remove).toEqual(cleaner.remove);
    });

});

describe('.decl()', () => {

    it('loads declarations by property', () => {
        expect(empty.decl('a')).toEqual(new Declaration('a'));
    });

    it('caches values', () => {
        expect(empty.decl('a')).toBe(empty.decl('a'));
    });

});

describe('.unprefixed()', () => {

    it('returns unprefixed version', () => {
        expect(empty.unprefixed('-moz-a')).toEqual('a');
    });

});

describe('.prefixed()', () => {

    it('adds prefix', () => {
        expect(empty.prefixed('a', '-ms-')).toEqual('-ms-a');
    });

    it('changes prefix', () => {
        expect(empty.prefixed('a', '-ms-')).toEqual('-ms-a');
    });

});

describe('values()', () => {

    it('returns values for this and all properties', () => {
        expect(fill.values('add', 'a')).toEqual([bVal]);
        expect(fill.values('remove', 'a')).toEqual([
            old('-ms-b'),
            old('-moz-b'),
            old('-webkit-b')
        ]);
    });

});

describe('group()', () => {

    describe('down()', () => {

        it('checks prefix group', () => {
            const css   = parse('a { -ms-a: 1; -o-a: 1; a: 1; b: 2 }');
            const props = [];

            empty.group(css.first.first).down(i => props.push(i.prop));
            expect(props).toEqual(['-o-a', 'a']);
        });

        it('checks prefix groups', () => {
            const css = parse('a { -ms-a: 1; -o-a: 1; ' +
                              'a: -o-calc(1); a: 1; a: 2 }');
            const props = [];

            empty.group(css.first.first).down(i => props.push(i.prop));
            expect(props).toEqual(['-o-a', 'a', 'a']);
        });

        it('returns check decls inside group', () => {
            const css  = parse('a { -moz-a: 1; -ms-a: 1; -o-a: 1; a: 1 }');
            const decl = css.first.first;

            expect(empty.group(decl).down(i => i.prop === '-o-a')).toBeTruthy();
            expect(empty.group(decl).down(i => i.prop === '-o-b')).toBeFalsy();
        });

    });

    describe('up()', () => {

        it('checks prefix group', () => {
            const css   = parse('a { b: 2; -ms-a: 1; -o-a: 1; a: 1 }');
            const props = [];

            empty.group(css.first.nodes[3]).up(i => props.push(i.prop));
            expect(props).toEqual(['-o-a', '-ms-a']);
        });

        it('checks prefix groups', () => {
            const css = parse('a { a: 2; -ms-a: 1; ' +
                              '-o-a: 1; a: -o-calc(1); a: 1  }');
            const props = [];

            empty.group(css.first.nodes[4]).up(i => props.push(i.prop));
            expect(props).toEqual(['a', '-o-a', '-ms-a']);
        });

        it('returns check decls inside group', () => {
            const css  = parse('a { -moz-a: 1; -ms-a: 1; -o-a: 1; a: 1 }');
            const decl = css.first.nodes[3];

            expect(empty.group(decl).up(i => i.prop === '-ms-a')).toBeTruthy();
            expect(empty.group(decl).up(i => i.prop === '-ms-b')).toBeFalsy();
        });

    });

});
