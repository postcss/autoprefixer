autoprefixer = require('./')
postcss      = require('postcss')

css = 'a {\n  transition: backdrop-filter 1s, color 100ms\n}'

fs  = require('fs')
css = fs.readFileSync('test/cases/transition.css').toString()

prefixes = postcss([
    autoprefixer({ browsers: 'Chrome 25, Opera 12' })
]).process(css).css;

console.log(postcss([
    autoprefixer({ browsers: 'Chrome 25, Opera 12' })
]).process(prefixes).css)
