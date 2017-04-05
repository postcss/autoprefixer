browserslist = require('browserslist')

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
  and_uc:  'UC for Android'

prefix = (name, prefixes) ->
  out  = '  ' + name + ': '
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
  coverage = browserslist.coverage(prefixes.browsers.selected)
  round    = Math.round(coverage * 100) / 100.0;
  out     += "\nThese browsers account for #{ round }% of all users globally\n"

  atrules = ''
  for name, data of prefixes.add
    if name[0] == '@' and data.prefixes
      atrules += prefix(name, data.prefixes)
  out += "\nAt-Rules:\n" + atrules if atrules != ''

  selectors = ''
  for selector in prefixes.add.selectors
    if selector.prefixes
      selectors += prefix(selector.name, selector.prefixes)
  out += "\nSelectors:\n" + selectors if selectors != ''

  values = ''
  props  = ''
  for name, data of prefixes.add
    if name[0] != '@' and data.prefixes
      props += prefix(name, data.prefixes)

    continue unless data.values
    for value in data.values
      string = prefix(value.name, value.prefixes)
      if values.indexOf(string) == -1
        values += string

  out += "\nProperties:\n" + props  if props  != ''
  out += "\nValues:\n"     + values if values != ''

  if atrules == '' and selectors == '' and props == '' and values == ''
    out += '\nAwesome! Your browsers don\'t require any vendor prefixes.' +
           '\nNow you can remove Autoprefixer from build steps.'

  out
