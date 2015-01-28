# Convert Can I Use data to Autoprefixer’s

module.exports = { }
for name, data of require('caniuse-db/data').agents
  module.exports[name] =
    prefix: if name == 'opera' then '-o-' else "-#{data.prefix}-"
