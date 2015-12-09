last = (array) -> array[array.length - 1]

brackets =

  # Parse string to nodes tree
  parse: (str) ->
    current = ['']
    stack   = [current]

    for sym in str
      if sym == '('
        current = ['']
        last(stack).push(current)
        stack.push(current)

      else if sym == ')'
        stack.pop()
        current = last(stack)
        current.push('')

      else
        current[current.length - 1] += sym

    stack[0]

  # Generate output string by nodes tree
  stringify: (ast) ->
    result = ''
    for i in ast
      if typeof i == 'object'
        result += '(' + brackets.stringify(i) + ')'
      else
        result += i
    result

module.exports = brackets
