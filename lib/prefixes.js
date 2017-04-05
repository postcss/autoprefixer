Declaration = require('./declaration')
Resolution  = require('./resolution')
Transition  = require('./transition')
Processor   = require('./processor')
Supports    = require('./supports')
Browsers    = require('./browsers')
Selector    = require('./selector')
AtRule      = require('./at-rule')
Value       = require('./value')
utils       = require('./utils')

vendor = require('postcss/lib/vendor')

Selector.hack require('./hacks/fullscreen')
Selector.hack require('./hacks/placeholder')

Declaration.hack require('./hacks/flex')
Declaration.hack require('./hacks/order')
Declaration.hack require('./hacks/filter')
Declaration.hack require('./hacks/grid-end')
Declaration.hack require('./hacks/flex-flow')
Declaration.hack require('./hacks/flex-grow')
Declaration.hack require('./hacks/flex-wrap')
Declaration.hack require('./hacks/grid-start')
Declaration.hack require('./hacks/align-self')
Declaration.hack require('./hacks/flex-basis')
Declaration.hack require('./hacks/mask-border')
Declaration.hack require('./hacks/align-items')
Declaration.hack require('./hacks/flex-shrink')
Declaration.hack require('./hacks/break-props')
Declaration.hack require('./hacks/writing-mode')
Declaration.hack require('./hacks/border-image')
Declaration.hack require('./hacks/justify-items')
Declaration.hack require('./hacks/align-content')
Declaration.hack require('./hacks/border-radius')
Declaration.hack require('./hacks/block-logical')
Declaration.hack require('./hacks/grid-template')
Declaration.hack require('./hacks/inline-logical')
Declaration.hack require('./hacks/grid-row-align')
Declaration.hack require('./hacks/transform-decl')
Declaration.hack require('./hacks/flex-direction')
Declaration.hack require('./hacks/image-rendering')
Declaration.hack require('./hacks/justify-content')
Declaration.hack require('./hacks/background-size')
Declaration.hack require('./hacks/text-emphasis-position')

Value.hack require('./hacks/stretch')
Value.hack require('./hacks/gradient')
Value.hack require('./hacks/pixelated')
Value.hack require('./hacks/image-set')
Value.hack require('./hacks/cross-fade')
Value.hack require('./hacks/flex-values')
Value.hack require('./hacks/display-flex')
Value.hack require('./hacks/display-grid')
Value.hack require('./hacks/filter-value')

declsCache = { }

class Prefixes
  constructor: (@data, @browsers, @options = { }) ->
    [@add, @remove] = @preprocess(@select(@data))
    @transition     = new Transition(@)
    @processor      = new Processor(@)

  # Return clone instance to remove all prefixes
  cleaner: ->
    unless @cleanerCache
      if @browsers.selected.length
        empty = new Browsers(@browsers.data, [])
        @cleanerCache = new Prefixes(@data, empty, @options)
      else
        return this

    @cleanerCache

  # Select prefixes from data, which is necessary for selected browsers
  select: (list) ->
    selected = { add: { }, remove: { } }

    for name, data of list
      add = data.browsers.map (i) ->
        params = i.split(' ')
        browser: params[0] + ' ' + params[1], note: params[2]

      notes = add.filter( (i) -> i.note ).map (i) =>
        @browsers.prefix(i.browser) + ' ' + i.note
      notes = utils.uniq(notes)

      add = add.filter( (i) => @browsers.isSelected(i.browser) ).map (i) =>
        prefix = @browsers.prefix(i.browser)
        if i.note
          prefix + ' ' + i.note
        else
          prefix

      add = @sort utils.uniq(add)

      if @options.flexbox == 'no-2009'
        add = add.filter (i) -> i.indexOf('2009') == -1

      all = data.browsers.map( (i) => @browsers.prefix(i) )
      all = all.concat(data.mistakes) if data.mistakes
      all = all.concat(notes)
      all = utils.uniq(all)

      if add.length
        selected.add[name] = add
        if add.length < all.length
          selected.remove[name] = all.filter (i) -> add.indexOf(i) == -1
      else
        selected.remove[name] = all

    selected

  # Sort vendor prefixes
  sort: (prefixes) ->
    prefixes.sort (a, b) ->
      aLength = utils.removeNote(a).length
      bLength = utils.removeNote(b).length

      if aLength == bLength
        b.length - a.length
      else
        bLength - aLength

  # Cache prefixes data to fast CSS processing
  preprocess: (selected) ->
    add = { selectors: [], '@supports': new Supports(Prefixes, @) }
    for name, prefixes of selected.add
      if name == '@keyframes' or name == '@viewport'
        add[name] = new AtRule(name, prefixes, @)

      else if name == '@resolution'
        add[name] = new Resolution(name, prefixes, @)

      else if @data[name].selector
        add.selectors.push(Selector.load(name, prefixes, @))

      else
        props = @data[name].props

        if props
          value = Value.load(name, prefixes, @)
          for prop in props
            add[prop] = { values: [] } unless add[prop]
            add[prop].values.push(value)
        else
          values = add[name]?.values || []
          add[name] = Declaration.load(name, prefixes, @)
          add[name].values = values

    remove = { selectors: [] }
    for name, prefixes of selected.remove
      if @data[name].selector
        selector = Selector.load(name, prefixes)
        for prefix in prefixes
          remove.selectors.push(selector.old(prefix))

      else if name == '@keyframes' or name == '@viewport'
        for prefix in prefixes
          prefixed = '@' + prefix + name[1..-1]
          remove[prefixed] = { remove: true }

      else if name == '@resolution'
        remove[name] = new Resolution(name, prefixes, @)

      else
        props = @data[name].props
        if props
          value = Value.load(name, [], @)
          for prefix in prefixes
            old = value.old(prefix)
            if old
              for prop in props
                remove[prop] = { }       unless remove[prop]
                remove[prop].values = [] unless remove[prop].values
                remove[prop].values.push(old)
        else
          for prefix in prefixes
            prop = vendor.unprefixed(name)
            olds = @decl(name).old(name, prefix)
            if name == 'align-self'
              a = add[name]?.prefixes
              if a
                if prefix == '-webkit- 2009' && a.indexOf('-webkit-') != -1
                  continue
                else if prefix == '-webkit-' && a.indexOf('-webkit- 2009') != -1
                  continue
            for prefixed in olds
              remove[prefixed] = {} unless remove[prefixed]
              remove[prefixed].remove = true

    [add, remove]

  # Declaration loader with caching
  decl: (prop) ->
    decl = declsCache[prop]

    if decl
      decl
    else
      declsCache[prop] = Declaration.load(prop)

  # Return unprefixed version of property
  unprefixed: (prop) ->
    value = @normalize(vendor.unprefixed(prop))
    value = 'flex-flow' if value == 'flex-direction'
    value

  # Normalize prefix for remover
  normalize: (prop) ->
    @decl(prop).normalize(prop)

  # Return prefixed version of property
  prefixed: (prop, prefix) ->
    prop = vendor.unprefixed(prop)
    @decl(prop).prefixed(prop, prefix)

  # Return values, which must be prefixed in selected property
  values: (type, prop) ->
    data = @[type]

    global = data['*']?.values
    values = data[prop]?.values

    if global and values
      utils.uniq global.concat(values)
    else
      global || values || []

  # Group declaration by unprefixed property to check them
  group: (decl) ->
    rule       = decl.parent
    index      = rule.index(decl)
    length     = rule.nodes.length
    unprefixed = @unprefixed(decl.prop)

    checker = (step, callback) =>
      index += step
      while index >= 0 and index < length
        other = rule.nodes[index]
        if other.type == 'decl'

          if step == -1 and other.prop == unprefixed
            break unless Browsers.withPrefix(other.value)

          if @unprefixed(other.prop) != unprefixed
            break

          else if callback(other) == true
            return true

          if step == +1 and other.prop == unprefixed
            break unless Browsers.withPrefix(other.value)

        index += step
      return false

    {
      up:   (callback) -> checker(-1, callback)
      down: (callback) -> checker(+1, callback)
    }

module.exports = Prefixes
