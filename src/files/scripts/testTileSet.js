/*global define */

var $ = require('../vendor/jquery/jquery.js');

    var articleMap = {},
        id = 0;

    $("#data li").each(function () {
        var $li = $(this),
            tags, url;

        try {
            url = $li.data('url');
            tags = JSON.parse($li.attr('data-tags'));
        } catch (e) {
            tags = [];
        }

        articleMap[id++] = {
            url: url,
            tags: tags,
            html: $li.html()
        };
    });

    $("#data").remove();

module.exports = articleMap;
