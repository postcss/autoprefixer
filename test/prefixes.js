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
const aVal  = new Value('a',    ['-moz-'], fill);
const bVal  = new Value('b', ['-ms- new'], fill);
const aProp = new Declaration('a', ['-moz-'], fill);
aProp.values = [bVal];

const old = function (prefixed) {
    const name = prefixed.replace(/-[^-]+-( old)?/, '');
    return new OldValue(name, prefixed);
};

describe('Prefixes', () => {

    describe('select()', () =>

    it('selects necessary prefixes', () =>
      fill.select(data.prefixes).should.eql({
          add: {
              a: ['-moz-'],
              b: ['-ms- new'],
              c: ['-ms-']
          },
          remove: {
              a: ['-webkit-', '-ms-', '-moz- old'],
              b: ['-ms-', '-moz-', '-webkit-'],
              c: ['-moz-']
          } })
  )
);

    describe('preprocess()', () => {

        it('preprocesses prefixes add data', () =>
      fill.add.should.eql({
          'selectors': [cSel],
          'a': aProp,
          '*': {
              values: [bVal]
          },
          '@supports': new Supports(Prefixes, fill)
      })
    );

        return it('preprocesses prefixes remove data', () =>
      JSON.stringify(fill.remove).should.eql(JSON.stringify({
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
      })
      )
    );
    });

    describe('.cleaner()', () => {

        it('returns itself is no browsers are selected', () => empty.cleaner().should.eql(empty));

        return it('returns Prefixes with empty browsers', () => {
            const cleaner = new Prefixes(data.prefixes, new Browsers(data.browsers, []));
            Object.keys(fill.cleaner().add).length.should.eql(2);
            return fill.cleaner().remove.should.eql(cleaner.remove);
        });
    });

    describe('.decl()', () => {

        it('loads declarations by property', () => empty.decl('a').should.eql(new Declaration('a')));

        return it('caches values', () => empty.decl('a').should.exactly(empty.decl('a')));
    });

    describe('.unprefixed()', () =>

    it('returns unprefixed version', () => empty.unprefixed('-moz-a').should.eql('a'))
  );

    describe('.prefixed()', () => {

        it('adds prefix', () => empty.prefixed('a', '-ms-').should.eql('-ms-a'));

        return it('changes prefix', () => empty.prefixed('a', '-ms-').should.eql('-ms-a'));
    });

    describe('values()', () =>

    it('returns values for this and all properties', () => {
        fill.values('add', 'a').should.eql([bVal]);

        return fill.values('remove', 'a').should.eql([old('-ms-b'),
            old('-moz-b'),
            old('-webkit-b')]);
    })
);

    return describe('group()', () => {

        describe('down()', () => {

            it('checks prefix group', () => {
                const css   = parse('a { -ms-a: 1; -o-a: 1; a: 1; b: 2 }');
                const props = [];

                empty.group(css.first.first).down(i => props.push(i.prop));
                return props.should.eql(['-o-a', 'a']);
            });

            it('checks prefix groups', () => {
                const css   = parse('a { -ms-a: 1; -o-a: 1; a: -o-calc(1); a: 1; a: 2 }');
                const props = [];

                empty.group(css.first.first).down(i => props.push(i.prop));
                return props.should.eql(['-o-a', 'a', 'a']);
            });

            return it('returns check decls inside group', () => {
                const css  = parse('a { -moz-a: 1; -ms-a: 1; -o-a: 1; a: 1 }');
                const decl = css.first.first;

                empty.group(decl).down( i => i.prop === '-o-a').should.be.true;
                return empty.group(decl).down( i => i.prop === '-o-b').should.be.false;
            });
        });

        return describe('up()', () => {

            it('checks prefix group', () => {
                const css   = parse('a { b: 2; -ms-a: 1; -o-a: 1; a: 1 }');
                const props = [];

                empty.group(css.first.nodes[3]).up(i => props.push(i.prop));
                return props.should.eql(['-o-a', '-ms-a']);
            });

            it('checks prefix groups', () => {
                const css   = parse('a { a: 2; -ms-a: 1; -o-a: 1; a: -o-calc(1); a: 1  }');
                const props = [];

                empty.group(css.first.nodes[4]).up(i => props.push(i.prop));
                return props.should.eql(['a', '-o-a', '-ms-a']);
            });

            return it('returns check decls inside group', () => {
                const css  = parse('a { -moz-a: 1; -ms-a: 1; -o-a: 1; a: 1 }');
                const decl = css.first.nodes[3];

                empty.group(decl).up( i => i.prop === '-ms-a').should.be.true;
                return empty.group(decl).up( i => i.prop === '-ms-b').should.be.false;
            });
        });
    });
});
