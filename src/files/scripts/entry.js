/**
 * The entry point of our application.
 */

'use strict';

/**
 * Dependencies
 */
var $ = require('../vendor/jquery/jquery.js');
var Renderer = require('./Renderer');
var Application = require('./Application');
var articleSet = require('./testTileSet');

// Adapted from https://gist.github.com/paulirish/1579671 which derived from
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller.
// Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon

// MIT license

if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());

window.setTimeoutWithRAF = function (fn, t) {
    return window.setTimeout(window.requestAnimationFrame.bind(this, fn), t);
};

/**
 * Load the webfonts.
 */
$.getScript('http://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js', function() {
    WebFont.load({
        custom: {
            families: [ 'Plantin', 'PlantinBold', /*'PlantinBoldItalic',*/ 'TradeGothic', 'TradeGothicBold' ],
            urls: [ '/styles/fonts.css' ]
        },
        active: function () {
            //todo: not this?
            window.setTimeoutWithRAF(function () {
                new Renderer(new Application(articleSet));
                window.setTimeoutWithRAF(function () {
                    $(document.body).addClass('loaded');
                }, 900);
            }, 300);
        }
    });
});
