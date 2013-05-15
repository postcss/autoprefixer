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
(function () {
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

// Split prefix and property name.
var splitPrefix = function (prop) {
    if ( prop[0] === '-' ) {
        var sep = prop.indexOf('-', 1) + 1;
        return { prefix: prop.slice(0, sep), name: prop.slice(sep) };
    } else {
        return { prefix: null, name: prop };
    }
};

// Generate RegExp to test, does CSS value contain some `word`.
var containRegexp = function (word) {
    return new RegExp('(^|\\s|,|\\()' +
               word.replace(/([.?*+\^\$\[\]\\(){}|\-])/g, "\\$1") +
               '($|\\s|\\()', 'ig');
};

// Throw error with `messages with mark, that is from Autoprefixer.
var error = function (message) {
    var err = new Error(message);
    err.autoprefixer = true;
    throw err;
};

// Class to edit rules array inside forEach.
var Rules = function(rules) {
    this.rules = rules;
};
Rules.prototype = {
    // Execute `callback` on every rule.
    forEach: function (callback) {
        for ( this.num = 0; this.num < this.rules.length; this.num += 1 ) {
            callback(this.rules[this.num]);
        }
    },

    // Check that rules contain rule with `prop` and `values`.
    contain: function (prop, value) {
        return this.rules.some(function (rule) {
            return rule.property === prop && rule.value === value;
        });
    },

    // Add new rule with `prop` and `value`.
    add: function (prop, value) {
        if ( this.contain(prop, value) ) {
            return;
        }

        this.rules.splice(this.num, 0, { property: prop, value: value });
        this.num += 1;
    },

    // Remove current rule.
    removeCurrent: function () {
        this.rules.splice(this.num, 1);
    }
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
//     use(autoprefixer.rework(last 1 version')).
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
        return rework(css).use(autoprefixer.rework(requirements)).toString();
    },

    // Return Rework filter, which will add necessary prefixes for browsers
    // in `requirements`.
    rework: function (requirements) {
        if ( !requirements ) {
            requirements = [];
        } else if ( !Array.isArray(requirements) ) {
            requirements = [requirements];
        }

        var browsers   = this.parse(requirements);
        var values     = this.filter(this.data.values, browsers);
        var props      = this.filter(this.data.props,  browsers);
        var prefixes   = this.prefixes(props, values);
        var unprefixes = this.unprefixes(props, values);

        return function (style) {
            autoprefixer.unprefixer(unprefixes, style);
            autoprefixer.prefixer(prefixes, style);
        };
    },

    // Change `style` declarations in parsed CSS, to add prefixes for `props`.
    prefixer: function (props, style) {
        var all      = props['*'];
        var prefixes = ['-webkit-', '-moz-', '-ms-', '-o-'];

        var transitions = { };
        for ( var i in props ) {
            if ( props[i].transition && props[i].prefixes ) {
                transitions[i] = props[i];
            }
        }
        var isTransition = /(-(webkit|moz|ms|o)-)?transition(-property)?/;

        // Keyframes
        if ( props['@keyframes'] ) {
            style.rules.forEach(function(rule) {
                if ( !rule.keyframes ) {
                    return;
                }

                props['@keyframes'].prefixes.forEach(function (prefix) {
                    var contain = style.rules.some(function (other) {
                        return other.keyframes && rule.name === other.name &&
                               other.vendor === prefix;
                    });
                    if ( contain ) {
                        return;
                    }

                    var clone = { name: rule.name };
                    clone.vendor = rule.vendor;
                    clone.keyframes = [];
                    rule.keyframes.forEach(function (keyframe) {
                        var keyframeClone          = { };
                        keyframeClone.values       = keyframe.values.slice();
                        keyframeClone.declarations = keyframe.declarations.map(
                            function (i) {
                                return { property: i.property, value: i.value };
                            });

                        clone.keyframes.push(keyframeClone);
                    });


                    clone.vendor = prefix;
                    style.rules.push(clone);
                });
             });
        }

        rework.visit.declarations(style, function (list, node) {
            var rules = new Rules(list);

            // Properties
            rules.forEach(function (rule) {
                var prop = props[rule.property];

                if ( !prop || !prop.prefixes ) {
                    return;
                }
                if ( prop.check && !prop.check.call(rule.value, rule) ) {
                    return;
                }

                prop.prefixes.forEach(function (prefix) {
                    if ( node.vendor && node.vendor !== prefix ) {
                        return;
                    }
                    var wrong = prefixes.some(function (other) {
                        if ( other === prefix ) {
                            return false;
                        }
                        return rule.value.indexOf(other) !== -1;
                    });
                    if ( wrong ) {
                        return;
                    }

                    rules.add(prefix + rule.property, rule.value);
                });
            });

            // Values
            rules.forEach(function (rule) {
                var split  = splitPrefix(rule.property);
                var vendor = split.prefix || node.vendor;
                var prop   = props[split.name];

                var valuePrefixer = function (values) {
                    var prefixed = { };

                    for ( var name in values ) {
                        var value = values[name];
                        if ( !rule.value.match(value.regexp) ) {
                            continue;
                        }

                        value.prefixes.forEach(function (prefix) {
                            if ( vendor && vendor !== prefix ) {
                                return;
                            }
                            if ( !prefixed[prefix] ) {
                                prefixed[prefix] = rule.value;
                            }
                            if ( value.replace ) {
                                if ( prefixed[prefix].match(value.regexp) ) {
                                    var replaced = value.replace(
                                        prefixed[prefix], prefix, rules);
                                    if ( replaced ) {
                                        prefixed[prefix] = replaced;
                                        return;
                                    }
                                }
                            }

                            prefixed[prefix] = prefixed[prefix].replace(
                                value.regexp, '$1' + prefix + name + '$2');
                        });
                    }


                    for ( var prefix in prefixed ) {
                        if ( prefixed[prefix] === rule.value ) {
                            continue;
                        }

                        if ( vendor ) {
                            var exists = rules.contain(
                                rule.property, prefixed[prefix]);
                            if ( exists ) {
                                rules.removeCurrent();
                            } else {
                                rule.value = prefixed[prefix];
                            }
                        } else {
                            rules.add(rule.property, prefixed[prefix]);
                        }
                    }
                };

                if ( all ) {
                    valuePrefixer(all.values);
                }
                if ( prop ) {
                    valuePrefixer(prop.values);
                }
                if ( rule.property.match(isTransition) ) {
                    valuePrefixer(transitions);
                }
            });
        });
    },

    // Change `style` declarations in parsed CSS, to remove `remove`.
    unprefixer: function (remove, style) {
        var all = remove.values['*'];

        // Keyframes
        style.rules = style.rules.filter(function (rule) {
            return !(rule.keyframes && remove.keyframes[rule.vendor]);
        });

        rework.visit.declarations(style, function (rules) {
            for ( var num = 0; num < rules.length; num += 1 ) {
                var rule = rules[num];

                // Properties
                if ( remove.props[rule.property] ) {
                    rules.splice(num, 1);
                    continue;
                }

                // Values
                var prop   = splitPrefix(rule.property).name;
                var values = all;
                if ( remove.values[prop] ) {
                    values = values.concat(remove.values[prop]);
                }
                if ( prop === 'transition' || prop === 'transition-property' ) {
                    values = values.concat(remove.transition);
                }
                values.forEach(function (value) {
                    if ( rule.value.match(value) ) {
                        rules.splice(num, 1);
                        return false;
                    }
                });
            }
        });
    },

    // Return array of browsers for requirements in free form.
    parse: function (requirements) {
        if ( requirements.length === 0 ) {
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
        for ( var name in this.data.browsers ) {
            var browser  = this.data.browsers[name];
            var versions = criteria(browser).map(function (version) {
                return name + ' ' + version;
            });
            selected = selected.concat(versions);
        }
        return selected;
    },

    // Check browser name and reduce version if them from future.
    check: function (req) {
        req = req.split(/\s+/);
        if ( req.length > 2 ) {
            error('Unknown browsers requirement `' + req.join(' ')  + '`');
        }

        var name    = req[0];
        var version = parseFloat(req[1]);

        var data = this.data.browsers[name];
        if ( !data ) {
            error('Unknown browser `' + name + '`');
        }
        if ( !version ) {
            error("Can't recognize version in `" + req + '`');
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
    filter: function (data, browsers) {
        var selected = { };
        for ( var name in data ) {
            var need     = data[name].browsers;
            var prefixes = browsers.filter(function (browser) {
                return need.indexOf(browser) !== -1;
            }).map(function (browser) {
                var key = browser.split(' ')[0];
                return autoprefixer.data.browsers[key].prefix;
            }).sort(function (a, b) { return b.length - a.length; });

            if ( prefixes.length ) {
                prefixes = uniq(prefixes);

                var obj = { prefixes: prefixes };
                for ( var key in data[name] ) {
                    if ( key === 'browsers' ) {
                        continue;
                    }
                    obj[key] = data[name][key];
                }

                if ( obj.props || obj.transition ) {
                    obj.regexp = containRegexp(name);
                }

                selected[name] = obj;
            }
        }
        return selected;
    },

    // Return properties, which them prefixed values inside.
    prefixes: function (props, values) {
        for ( var name in values ) {
            values[name].props.forEach(function (prop) {
                if ( !props[prop] ) {
                    props[prop] = { values: { } };
                } else if ( !props[prop].values ) {
                    props[prop].values = { };
                }

                props[prop].values[name] = values[name];
            });
        }

        return props;
    },

    // Return old properties and values to remove.
    unprefixes: function (props, values) {
        var remove = { props: {}, values: {}, transition: [], keyframes: {} };
        var name, prefixes, prop, value, names;

        for ( name in this.data.props ) {
            prop     = this.data.props[name];
            prefixes = prop.browsers.map(function (b) {
                var key = b.split(' ')[0];
                return autoprefixer.data.browsers[key].prefix;
            });
            uniq(prefixes).filter(function (prefix) {
                if ( !props[name] ) {
                    return true;
                }
                return props[name].prefixes.indexOf(prefix) === -1;
            }).forEach(function (prefix) {
                if ( prop.transition ) {
                    remove.transition.push(containRegexp(prefix + name));
                }
                if ( name === '@keyframes' ) {
                    remove.keyframes[prefix] = true;
                } else {
                    if ( prop.prefixed && prop.prefixed[prefix] ) {
                        remove.props[prop.prefixed[prefix]] = true;
                    } else {
                        remove.props[prefix + name] = true;
                    }
                }
            });
        }

        for ( name in this.data.values ) {
            value = this.data.values[name];
            prefixes = value.browsers.map(function (b) {
                var key = b.split(' ')[0];
                return autoprefixer.data.browsers[key].prefix;
            });
            names = uniq(prefixes).filter(function (prefix) {
                if ( !values[name] ) {
                    return true;
                }
                return values[name].prefixes.indexOf(prefix) === -1;
            }).map(function (prefix) {
                return containRegexp(prefix + name);
            });

            value.props.forEach(function (prop) {
                if ( !remove.values[prop] ) {
                    remove.values[prop] = [];
                }
                remove.values[prop] = remove.values[prop].concat(names);
            });
        }

        return remove;
    }
};

module.exports = autoprefixer;
})();
