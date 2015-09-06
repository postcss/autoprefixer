OldValue = require('../old-value')
Value    = require('../value')
utils    = require('../utils')
list     = require('postcss/lib/list')

class CrossFade extends Value
  @names = ['cross-fade']

  replace: (string, prefix) ->
    list.space(string)
      .map (value) =>
        return value if value[0..@name.length] != @name + '('

        close = value.lastIndexOf(')')
        after = value[close + 1..-1]
        args  = value[@name.length + 1..close - 1]

        if prefix == '-webkit-'
          match = args.match(/\d*.?\d+%?/)
          if match
            args  = args[match[0].length..-1].trim()
            args += ', ' + match[0]
          else
            args += ', 0.5'
        prefix + @name + '(' + args + ')' + after
      .join(' ')

module.exports = CrossFade
