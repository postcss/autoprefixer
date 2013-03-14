/*
 * Copyright 2013 Andrey Sitnik <andrey@sitnik.ru>,
 * sponsored by Evil Martians.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict'

var rework = require('rework');

// Return rework CSS filter, that add all needed `rework.prefix`
// and `rework.prefixValue` for selected browsers.
//
// Lets add prefixes only for last 2 version of Chrome, Firefox, IE, Safari and
// Opera:
//
//   rework(css).
//     use( vendors('last 2 versions') ).
//     toString();
//
// You can also select support browsers by global usage statistics:
//
//   vendors('> 1%')
//
// Or select browsers manually:
//
//   vendors('chrome 26', 'ff 20', 'ie 10')
var vendors = function (requirements) {
    if ( !requirements ) {
        requirements = ['last 2 versions'];
    }

    if ( !Array.isArray(requirements) ) {
        requirements = Array.prototype.slice.call(arguments);
    }

    var browsers = vendors.parse(requirements);
    var props    = vendors.props(browsers);

    return function (style, filters) {
        props.forEach(function (prop) {
            if ( !prop.onlyValue ) {
                filters.use( rework.prefix(prop.name, prop.prefixes) );
            }
            if ( prop.onlyValue || prop.transition ) {
                filters.use( rework.prefixValue(prop.name, prop.prefixes) );
            }
        });
    };
};

// Shortcut to call Rework with only vendors plugin.
//
//   vendors.compile(css, 'last 2 versions')
//
// same to:
//
//   rework(css).
//     use( vendors('last 2 versions') ).
//     toString();
vendors.compile = function (css, requirements) {
    return rework(css).use(vendors(requirements)).toString();
};

// Load data
vendors.data = {
    browsers: require('../data/browsers'),
    props:    require('../data/props')
};

// Return array, that doesn’t contain duplicates.
vendors.uniq = function (array) {
    var filtered = [];
    array.forEach(function (i) {
        if ( filtered.indexOf(i) === -1 ) {
            filtered.push(i);
        }
    });
    return filtered;
}

// Return array of browsers for requirements in free form.
vendors.parse = function (requirements) {
    var match;
    var browsers = [];
    requirements.map(function (req) {

      if ( match = req.match(/^last (\d+) versions?$/i) ) {
          return vendors.browsers(function(browser) {
              return browser.versions.slice(0, match[1]);
          });

      } else if ( match = req.match(/^> (\d+)%$/i) ) {
          return vendors.browsers(function(browser) {
              return browser.versions.filter(function (version, i) {
                  return browser.popularity[i] > match[1];
              });
          });

      } else {
          return [vendors.check(req)];
      }

    }).forEach(function (reqBrowsers) {
        browsers = browsers.concat(reqBrowsers);
    });
    return this.uniq(browsers);
};

// Select browsers by some `criteria`.
vendors.browsers = function (criteria) {
    var selected = [];
    var versions, browser;
    for ( var name in vendors.data.browsers ) {
        browser  = vendors.data.browsers[name];
        versions = criteria(browser).map(function (version) {
            return name + ' ' + version;
        });
        selected = selected.concat(versions);
    }
    return selected;
};

// Check browser name and reduce version if them from future.
vendors.check = function (req) {
    req = req.split(/\s+/);
    var name    = req[0];
    var version = parseFloat(req[1]);

    var data = vendors.data.browsers[name];
    if ( !data ) {
        throw new Error('Unknown browser `' + name + '`');
    }
    if ( !version ) {
        throw new Error("Can't recognize version in `" + req + '`');
    }

    if ( version > data.versions[0] ) {
        version = data.versions[0];
    }
    if ( version < data.versions[data.versions.length - 1] ) {
        version = data.versions[data.versions.length - 1];
    }

    return name + ' ' + version;
};

// Return CSS properties, which need prefix for `browsers`.
vendors.props = function (browsers) {
    var selected = [];
    var prefixes;
    for ( var prop in vendors.data.props ) {
        prefixes = vendors.prefixes(prop, browsers);
        if ( prefixes.length ) {
            selected.push({
                name:       prop,
                prefixes:   prefixes,
                onlyValue:  vendors.data.props[prop].onlyValue,
                transition: vendors.data.props[prop].transition
            });
        }
    }
    return selected;
};

// Return `prop` prefixes, which will be need to `browsers`.
vendors.prefixes = function (prop, browsers) {
    var need = vendors.data.props[prop].browsers;

    var prefixes = browsers.filter(function (browser) {
        return need.indexOf(browser) != -1;
    }).map(function (browser) {
        var name = browser.split(' ')[0];
        return vendors.data.browsers[name].prefix;
    })
    return vendors.uniq(prefixes);
};

module.exports = vendors;
