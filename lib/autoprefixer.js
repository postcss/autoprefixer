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
'use strict';

var rework = require('rework');

// Return array, that doesn’t contain duplicates.
var uniq = function (array) {
    var filtered = [];
    array.forEach(function (i) {
        if ( filtered.indexOf(i) === -1 ) {
            filtered.push(i);
        }
    });
    return filtered;
};

// Parse CSS and add prefixed properties and values by Can I Use database
// for actual browsers.
//
//   var prefixed = autoprefixer.compile(css);
//
// By default, it add prefixes for last 2 releases of each browsers.
// You can use global statistics to select browsers:
//
//   autoprefixer.compile(css, '> 1%');
//
// versions fo each browsers:
//
//   autoprefixer.compile(css, 'last 1 version');
//
// or set them manually:
//
//   autoprefixer.compile(css, ['chrome 26', 'ff 20', 'ie 10']);
//
// If you want to combine Autoprefixer with another Rework filters,
// you can use it as separated filter:
//
//   rework(css).
//     use(autoprefixer.filter(last 1 version')).
//     toString();
var autoprefixer = {
    // Load data
    data: {
        browsers: require('../data/browsers'),
        values:   require('../data/values'),
        props:    require('../data/props')
    },

    // Parse `css` by Rework and add prefixed properties for browsers
    // in `requirements`.
    compile: function (css, requirements) {
        return rework(css).use(autoprefixer.filter(requirements)).toString();
    },

    // Return Rework filter, which will add necessary prefixes for browsers
    // in `requirements`.
    filter: function (requirements) {
        if ( !requirements ) {
            requirements = [];
        } else if ( !Array.isArray(requirements) ) {
            requirements = [requirements];
        }

        var browsers = this.parse(requirements);
        var values   = this.prefixed(this.data.values, browsers);
        var props    = this.prefixed(this.data.props,  browsers);

        return function (style, filters) {
            values.forEach(function (val) {
                filters.use(rework.prefixValue(val.name, val.prefixes));
            });
            props.forEach(function (prop) {
                if ( prop.name == '@keyframes' ) {
                    filters.use( rework.keyframes(prop.prefixes) );
                } else {
                    filters.use( rework.prefix(prop.name, prop.prefixes) );
                    if ( prop.transition ) {
                        filters.use(
                            rework.prefixValue(prop.name, prop.prefixes));
                    }
                }
            });
        };
    },

    // Return array of browsers for requirements in free form.
    parse: function (requirements) {
        if ( requirements.length == 0 ) {
            requirements = ['last 2 versions'];
        }

        var match;
        var browsers = [];
        requirements.map(function (req) {

          if ( match = req.match(/^last (\d+) versions?$/i) ) {
              return autoprefixer.browsers(function(browser) {
                  return browser.versions.slice(0, match[1]);
              });

          } else if ( match = req.match(/^> (\d+(\.\d+)?)%$/i) ) {
              return autoprefixer.browsers(function(browser) {
                  return browser.versions.filter(function (version, i) {
                      return browser.popularity[i] > match[1];
                  });
              });

          } else {
              return [autoprefixer.check(req)];
          }

        }).forEach(function (reqBrowsers) {
            browsers = browsers.concat(reqBrowsers);
        });
        return uniq(browsers);
    },

    // Select browsers by some `criteria`.
    browsers: function (criteria) {
        var selected = [];
        var versions, browser;
        for ( var name in this.data.browsers ) {
            browser  = this.data.browsers[name];
            versions = criteria(browser).map(function (version) {
                return name + ' ' + version;
            });
            selected = selected.concat(versions);
        }
        return selected;
    },

    // Check browser name and reduce version if them from future.
    check: function (req) {
        req = req.split(/\s+/);
        var name    = req[0];
        var version = parseFloat(req[1]);

        var data = this.data.browsers[name];
        if ( !data ) {
            throw new Error('Unknown browser `' + name + '`');
        }
        if ( !version ) {
            throw new Error("Can't recognize version in `" + req + '`');
        }

        var last = data.versions[0];
        if ( data.future && data.future[0] ) {
            last = data.future[0];
        }

        if ( version > last ) {
            version = last;
        }
        if ( version < data.versions[data.versions.length - 1] ) {
            version = data.versions[data.versions.length - 1];
        }

        return name + ' ' + version;
    },

    // Return new `data` only with items, which need prefixes
    // for selected `browsers`.
    prefixed: function (data, browsers) {
        var need, prefixes;
        return Object.keys(data).map(function (name) {
            need     = data[name].browsers;
            prefixes = browsers.filter(function (browser) {
                return need.indexOf(browser) != -1;
            }).map(function (browser) {
                var key = browser.split(' ')[0];
                return autoprefixer.data.browsers[key].prefix;
            });

            if ( prefixes.length == 0 ) {
                return null;
            }
            prefixes = uniq(prefixes);

            return {
                name:       name,
                props:      data[name].props,
                prefixes:   prefixes,
                transition: data[name].transition
            };
        }).filter(function (i) { return i !== null });
    }
};

module.exports = autoprefixer;
