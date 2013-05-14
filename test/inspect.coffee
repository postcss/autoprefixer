inspect = require('../lib/autoprefixer/inspect')

describe 'inspect', ->
  it 'should inspect used browsers, properties and values', ->
    inspect(['ie 10']).should.eql(
      "Browsers:\n" +
      "  IE 10\n" +
      "\n" +
      "Properties:\n" +
      "  align-content*: ms\n" +
      "  align-items*: ms\n" +
      "  align-self*: ms\n" +
      "  flex*: ms\n" +
      "  flex-basis*: ms\n" +
      "  flex-direction*: ms\n" +
      "  flex-flow*: ms\n" +
      "  flex-grow*: ms\n" +
      "  flex-shrink*: ms\n" +
      "  flex-wrap*: ms\n" +
      "  justify-content*: ms\n" +
      "  order*: ms\n" +
      "  user-select: ms\n" +
      "* - properties, which can be used in transition\n" +
      "\n" +
      "Values:\n" +
      "  flex: ms\n" +
      "  inline-flex: ms\n")
