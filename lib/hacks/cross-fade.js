let list = require('postcss').list

let Value = require('../value')

const PERCENTAGE = /^\s*([+-]?(\d*\.)?\d+(e[+-]?\d+)?%?)/i

class CrossFade extends Value {
  replace(string, prefix) {
    return list
      .space(string)
      .map(value => {
        if (value.slice(0, +this.name.length + 1) !== this.name + '(') {
          return value
        }

        let close = value.lastIndexOf(')')
        let after = value.slice(close + 1)
        let args = value.slice(this.name.length + 1, close)

        if (prefix === '-webkit-') {
          let match = args.match(PERCENTAGE)
          if (match) {
            args = args.slice(match[0].length).trim()
            args += `, ${match[1]}`
          } else {
            args += ', 0.5'
          }
        }
        return prefix + this.name + '(' + args + ')' + after
      })
      .join(' ')
  }
}

CrossFade.names = ['cross-fade']

module.exports = CrossFade
