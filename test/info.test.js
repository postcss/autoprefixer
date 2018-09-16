let browserslist = require('browserslist')
let agents = require('caniuse-lite').agents

let Browsers = require('../lib/browsers')
let Prefixes = require('../lib/prefixes')
let info = require('../lib/info')

let data = {
  browsers: agents,
  prefixes: {
    'a': {
      browsers: ['firefox 21', 'firefox 20', 'chrome 30'],
      transition: true
    },
    'c': {
      browsers: ['firefox 21'],
      props: ['c']
    },
    'b': {
      browsers: ['ie 6', 'firefox 20'],
      props: ['a', '*']
    },
    'd': {
      browsers: ['firefox 21'],
      selector: true
    },
    'grid': {
      browsers: ['ie 6'],
      props: ['display']
    },
    'grid-row': {
      browsers: ['ie 6']
    },
    '@keyframes': {
      browsers: ['firefox 21']
    },
    'transition': {
      browsers: ['firefox 21']
    }
  }
}

it('returns selected browsers and prefixes', () => {
  let browsers = new Browsers(data.browsers,
    ['chrome 30', 'firefox 21', 'firefox 20', 'ie 6'])
  let prefixes = new Prefixes(data.prefixes, browsers)

  let coverage = browserslist.coverage(
    ['chrome 30', 'firefox 21', 'firefox 20', 'ie 6'])
  let round = Math.round(coverage * 100) / 100.0

  expect(info(prefixes)).toEqual(
    'Browsers:\n' +
        '  Chrome: 30\n' +
        '  Firefox: 21, 20\n' +
        '  IE: 6\n' +
        '\n' +
        `These browsers account for ${ round }% ` +
        'of all users globally\n' +
        '\n' +
        'At-Rules:\n' +
        '  @keyframes: moz\n' +
        '\n' +
        'Selectors:\n' +
        '  d: moz\n' +
        '\n' +
        'Properties:\n' +
        '  a: webkit, moz\n' +
        '  grid-row *: ms\n' +
        '  transition: moz\n' +
        '\n' +
        'Values:\n' +
        '  b: moz, ms\n' +
        '  c: moz\n' +
        '  grid *: ms\n' +
        '\n' +
        '* - Prefixes will be added only on grid: true option.\n'
  )
})

it('doesn\'t show transitions unless they are necessary', () => {
  let browsers = new Browsers(data.browsers,
    ['chrome 30', 'firefox 20'])
  let prefixes = new Prefixes(data.prefixes, browsers)

  let coverage = browserslist.coverage(
    ['chrome 30', 'firefox 20'])
  let round = Math.round(coverage * 100) / 100.0

  expect(info(prefixes)).toEqual(
    'Browsers:\n' +
        '  Chrome: 30\n' +
        '  Firefox: 20\n' +
        '\n' +
        `These browsers account for ${ round }% ` +
        'of all users globally\n' +
        '\n' +
        'Properties:\n' +
        '  a: webkit, moz\n' +
        '\n' +
        'Values:\n' +
        '  b: moz\n'
  )
})

it('returns string for empty prefixes', () => {
  let browsers = new Browsers(data.browsers, ['ie 7'])
  let prefixes = new Prefixes(data.prefixes, browsers)
  expect(info(prefixes)).toMatch(/remove Autoprefixer/)
})

it('returns string for empty browsers', () => {
  let browsers = new Browsers(data.browsers, [])
  let prefixes = new Prefixes(data.prefixes, browsers)
  expect(info(prefixes)).toEqual('No browsers selected')
})
