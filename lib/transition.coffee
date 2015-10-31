class Transition
  constructor: (@prefixes) ->

  # Properties to be processed
  props: ['transition', 'transition-property']

  # Process transition and add prefies for all necessary properties
  add: (decl) ->

  # Process transition and remove all unnecessary properties
  remove: (decl) ->


module.exports = Transition
