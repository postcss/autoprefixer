capitalize = (str) ->
  str.slice(0, 1).toUpperCase() + str.slice(1)

names =
  ie:      'IE'
  ie_mob:  'IE Mobile'
  ios_saf: 'iOS'
  op_mini: 'Opera Mini'
  op_mob:  'Opera Mobile'
  and_chr: 'Chrome for Android'
  and_ff:  'Firefox for Android'

prefix = (name, transition, prefixes) ->
    out  = '  ' + name + (if transition then '*' else '') + ': '
    out += prefixes.map( (i) -> i.replace(/^-(.*)-$/g, '$1') ).join(', ')
    out += "\n"
    out

module.exports = (prefixes) ->
  return "No browsers selected" if prefixes.browsers.selected.length == 0

  versions = []
  for browser in prefixes.browsers.selected
    [name, version] = browser.split(' ')

    name = names[name] || capitalize(name)
    if versions[name]
      versions[name].push(version)
    else
      versions[name] = [version]

  out  = "Browsers:\n"
  for browser, list of versions
    list = list.sort (a, b) -> parseFloat(b) - parseFloat(a)
    out += '  ' + browser + ': ' + list.join(', ') + "\n"

  atrules = ''
  for name, data of prefixes.add
    if name[0] == '@' and data.prefixes
      atrules += prefix(name, false, data.prefixes)
  out += "\nAt-Rules:\n" + atrules if atrules  != ''

  selectors = ''
  for selector in prefixes.add.selectors
    if selector.prefixes
      selectors += prefix(selector.name, false, selector.prefixes)
  out += "\nSelectors:\n" + selectors if selectors  != ''

  values = ''
  props  = ''
  useTransition  = false
  needTransition = prefixes.add.transition?.prefixes
  for name, data of prefixes.add
    if name[0] != '@' and data.prefixes
      transitionProp = needTransition and prefixes.data[name].transition
      useTransition  = true if transitionProp
      props += prefix(name, transitionProp, data.prefixes)

    continue unless data.values
    continue if prefixes.transitionProps.some (i) -> i == name
    for value in data.values
      string = prefix(value.name, false, value.prefixes)
      if values.indexOf(string) == -1
        values += string

  if useTransition
    props += "  * - can be used in transition\n"

  out += "\nProperties:\n" + props  if props  != ''
  out += "\nValues:\n"     + values if values != ''

  out
