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

var autoprefixer = require('../autoprefixer.js');

var transition;
var format = function (props) {
    transition = false;
    return props.map(function (prop) {
        var name = prop.name;
        if (prop.transition) {
            name += '*';
            transition = true;
        }
        return '  ' + name + ': ' + prop.prefixes.map(function (i) {
            return i.replace(/^-(.*)-$/g, '$1');
        }).join(', ');
    }).join("\n");
};

// Show, what browser, properties and values will used by autoprefixed
// with this `req`.
var inspect = function (reqs) {
    var browsers = autoprefixer.parse(reqs || []);
    var props    = autoprefixer.props(browsers);

    var name, version, last, selected = [];
    for (var i = 0; i < browsers.length; i++) {
        version = browsers[i].split(' ')[1];
        if ( browsers[i].indexOf(last) == 0 ) {
            selected[selected.length - 1] += ', ' + version;
        } else {
            last = browsers[i].split(' ')[0];
            if ( last == 'ie' ) {
                name = 'IE';
            } else if ( last == 'ff' ) {
                name = 'Firefox';
            } else if ( last == 'ios' ) {
                name = 'iOS';
            } else {
                name = last.slice(0, 1).toUpperCase() + last.slice(1);
            }
            selected.push(name + ' ' + version);
        }
    }

    var properties = props.filter(function (i) { return !i.onlyValue; });
    var values     = props.filter(function (i) { return  i.onlyValue; });

    var out  = "Browsers:\n" +
        selected.map(function (i) { return '  ' + i; }).join("\n") + "\n";

    if ( properties.length > 0 ) {
        out += "\nProperties:\n" + format(properties) + "\n";
        if ( transition ) {
            out += "* - properties, which can be used in transition\n"
        }
    }
    if ( values.length > 0 ) {
        out += "\nValues:\n" + format(values) + "\n"
    }
    return out;
};

module.exports = inspect;
