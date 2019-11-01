jest.doMock('chalk', () => ({ }))

let autoprefixer = require('../lib/autoprefixer')

it('works without chalk', () => {
  jest.spyOn(console, 'warn').mockImplementation(() => true)
  let instance = autoprefixer({ browsers: ['last 1 version'] })
  expect(instance.browsers).toEqual(['last 1 version'])
  expect(console.warn).toHaveBeenCalledTimes(1)
  expect(console.warn.mock.calls[0][0]).toContain('`overrideBrowserslist`')
})
