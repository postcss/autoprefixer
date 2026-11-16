let { execFileSync } = require('child_process')
let { mkdtempSync, rmdirSync, unlinkSync, writeFileSync } = require('fs')
let { tmpdir } = require('os')
let { join } = require('path')
let { test } = require('uvu')
let { equal, match, not } = require('uvu/assert')

const BIN = join(__dirname, '..', 'bin', 'autoprefixer')

let dir = mkdtempSync(join(tmpdir(), 'autoprefixer-bin-'))
writeFileSync(
  join(dir, '.browserslistrc'),
  '[production]\nie 11\n\n[legacy]\nie 8\n'
)

function run(...args) {
  return execFileSync(process.execPath, [BIN, ...args], {
    cwd: dir,
    encoding: 'utf8'
  })
}

test('uses the default Browserslist section', () => {
  match(run('--info'), 'IE: 11')
})

test('reads the environment from --env', () => {
  match(run('--info', '--env', 'legacy'), 'IE: 8')
})

test('reads the environment from --env=', () => {
  match(run('--info', '--env=legacy'), 'IE: 8')
})

test('accepts --env before the mode', () => {
  match(run('--env', 'legacy', '--info'), 'IE: 8')
})

test('shows an error on --env without a name', () => {
  let err
  try {
    run('--info', '--env')
  } catch (e) {
    err = e
  }
  equal(err.status, 1)
  match(err.stderr, '--env needs an environment name')
})

test('shows an error when --env is followed by a flag', () => {
  let err
  try {
    run('--env', '--info')
  } catch (e) {
    err = e
  }
  equal(err.status, 1)
  match(err.stderr, '--env needs an environment name')
})

test('shows --env in the help', () => {
  match(run(), '--env')
})

test('prints the version', () => {
  not.match(run('--version'), '--env')
})

test.after(() => {
  unlinkSync(join(dir, '.browserslistrc'))
  rmdirSync(dir)
})

test.run()
