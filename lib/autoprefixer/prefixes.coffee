utils = require('./utils')

Processor   = require('./processor')
Declaration = require('./declaration')
Keyframes   = require('./keyframes')
Selector    = require('./selector')
Value       = require('./value')

Selector.hack require('./hacks/fullscreen')
Selector.hack require('./hacks/placeholder')

Declaration.hack require('./hacks/filter')

Value.hack require('./hacks/gradient')
Value.hack require('./hacks/transform')
Value.hack require('./hacks/fill-available')

class Prefixes
  constructor: (@data, @browsers) ->
    [@add, @remove] = @preprocess(@select(@data))
    @otherCache     = { }
    @processor      = new Processor(@)

  transitionProps: ['transition', 'transition-property']

  # Select prefixes from data, which is necessary for selected browsers
  select: (list) ->
    selected = { add: { }, remove: { } }

    for name, data of list
      add = data.browsers.map (i) ->
        params = i.split(' ')
        browser: params[0] + ' ' + params[1], note: params[2]

      add = add.filter( (i) => @browsers.isSelected(i.browser) ).map (i) =>
        prefix = @browsers.prefix(i.browser)
        if i.note
          prefix + ' ' + i.note
        else
          prefix

      add = utils.uniq(add).sort( (a, b) -> b.length - a.length )

      all = data.browsers.map( (i) => @browsers.prefix(i) )
      all = all.concat(data.mistakes) if data.mistakes
      all = utils.uniq(all)

      if add.length
        selected.add[name] = add
        if add.length < all.length
          selected.remove[name] = all.filter (i) -> add.indexOf(i) == -1
      else
        selected.remove[name] = all

    selected

  # Cache prefixes data to fast CSS processing
  preprocess: (selected) ->
    add = { selectors: [] }
    for name, prefixes of selected.add
      if name == '@keyframes'
        add[name] = new Keyframes(name, prefixes)

      else if @data[name].selector
        add.selectors.push(Selector.load(name, prefixes))

      else
        props = if @data[name].transition
          @transitionProps
        else
          @data[name].props

        if props
          value = Value.load(name, prefixes)
          for prop in props
            add[prop] = { values: [] } unless add[prop]
            add[prop].values.push(value)

        unless @data[name].props
          values = add[name]?.values || []
          add[name] = Declaration.load(name, prefixes)
          add[name].values = values

    remove = { selectors: [] }
    for name, prefixes of selected.remove
      if @data[name].selector
        selector = Selector.load(name, prefixes)
        for prefix in prefixes
          remove.selectors.push(selector.prefixed(prefix))

      else
        props = if @data[name].transition
          @transitionProps
        else
          @data[name].props

        if props
          value = Value.load(name)
          for prefix in prefixes
            old = value.old(prefix)
            for prop in props
              remove[prop] = { }       unless remove[prop]
              remove[prop].values = [] unless remove[prop].values
              remove[prop].values.push(old)

        unless @data[name].props
          for prefix in prefixes
            prefixed = prefix + name
            remove[prefixed] = {} unless remove[prefixed]
            remove[prefixed].remove = true

    [add, remove]

  # Return values, which must be prefixed in selected property
  values: (type, prop) ->
    data = @[type]

    global = data['*']?.values
    values = data[prop]?.values

    if global and values
      utils.uniq global.concat(values)
    else
      global || values || []

module.exports = Prefixes
