fs = require('fs')

task 'update', 'Update browsers and properties data', ->
   require('./updaters/' + i) for i in fs.readdirSync(__dirname + '/updaters')

task 'build', 'Build autoprefixer.js to standalone work', ->
  https = require('https')

  js = fs.readFileSync(__dirname + '/lib/autoprefixer.js').toString()
  js = js.replace("'use strict';\n", '')
  js = js.replace("module.exports = autoprefixer;",
                  "window.autoprefixer = autoprefixer;\n})();")

  data = (file) ->
    fs.readFileSync("#{ __dirname }/data/#{ file }.js").toString().
      replace('module.exports = ', '').
      replace(/\/\/[^\n]+\n+/g, '').
      replace("};\n", '}')

  js = js.replace "require('../data/browsers')", -> data('browsers')
  js = js.replace "require('../data/props')",    -> data('props')

  url = 'https://raw.github.com/visionmedia/rework/master/rework.js'
  https.get url, (res) ->
    rework = '';
    res.on 'data', (chunk) -> rework += chunk
    res.on 'end', ->
      js = js.replace "var rework = require('rework');", ->
         rework + "\n(function () {"
      fs.writeFileSync(__dirname + '/autoprefixer.js', js)
