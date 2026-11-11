let { spawn } = require('child_process')
let { join } = require('path')
let { test } = require('uvu')
let { is } = require('uvu/assert')

const BIN = join(__dirname, '..', 'bin', 'autoprefixer')

function closedStdout(arg) {
  let cli = spawn(process.execPath, [BIN, arg])
  cli.stdout.destroy()
  let stderr = ''
  cli.stderr.on('data', data => {
    stderr += data.toString()
  })
  return new Promise(resolve => {
    cli.on('close', code => {
      resolve({ code, stderr })
    })
  })
}

test('exits quietly when stdout is closed early', async () => {
  for (let arg of ['--version', '--help']) {
    let { code, stderr } = await closedStdout(arg)
    is(stderr, '')
    is(code, 0)
  }
})

test.run()
