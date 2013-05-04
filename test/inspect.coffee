inspect = require('../lib/autoprefixer/inspect')

describe 'inspect', ->
  it 'should inspect used browsers, properties and values', ->
    inspect().should.eql(
      "Browsers:\n" +
      "  Chrome 3, 2\n" +
      "  IE 3, 2\n" +
      "  Opera 3, 2\n" +
      "\n" +
      "Properties:\n" +
      "  @keyframes: webkit, ms\n" +
      "  filter*: ms\n" +
      "  transform*: ms\n" +
      "  transition: webkit\n" +
      "* - properties, which can be used in transition\n" +
      "\n" +
      "Values:\n" +
      "  calc: webkit, ms\n" +
      "  linear-gradient: webkit\n")
