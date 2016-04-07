"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.listCategories = exports.toSlack = exports.getRandomPost = exports.loadNews = undefined;

var _feedparserPromised = require('feedparser-promised');

var _feedparserPromised2 = _interopRequireDefault(_feedparserPromised);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _striptags = require('striptags');

var _striptags2 = _interopRequireDefault(_striptags);

var _helptos = require('helptos');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * get rss url form array of categories by category name
 *
 * @param categories
 * @param category
 * @returns {*}
 */
var getRssUrl = function getRssUrl(categories, category) {

    var el = (0, _helptos.getFirstByName)(categories, category),
        output = false;

    if (el && el.url) {
        output = el.url;
    }

    return output;
};

var configFile = '../config/news.json';
var categories = (0, _helptos.getConfig)(configFile).categories.filter(function (category) {
    return (0, _helptos.hasAllPropsSet)(['name', 'url'])(category);
});
_moment2.default.locale('de');

/**
 *
 *
 * @param category
 * @param callback
 * @returns {Promise}
 */
var loadNews = exports.loadNews = function loadNews() {
    var category = arguments.length <= 0 || arguments[0] === undefined ? 'alles' : arguments[0];
    var callback = arguments[1];


    return new Promise(function (resolve, reject) {

        var rssURL = getRssUrl(categories, category);

        if (!rssURL) {
            reject('Category "' + category + '" not found.\nAvailable categories:\n' + getNameList(categories));
        }

        _feedparserPromised2.default.parse(rssURL).then(function (items) {

            resolve(items.map(function (item) {
                return {
                    date: (0, _moment2.default)(item.pubDate).fromNow(),
                    title: item.title,
                    url: item.link,
                    description: (0, _striptags2.default)(item.description).replace(/(\r\n|\n|\r)/gm, "")
                };
            }));
        }).catch(function (error) {
            reject('error: ' + error);
        });
    });
};

/**
 * get a random post
 *
 * @param items
 */
var getRandomPost = exports.getRandomPost = function getRandomPost(items) {
    return (0, _helptos.getRandomEntry)(items);
};

/**
 * converts news item to a slack message
 *
 * @param item
 * @returns {Promise}
 */
var toSlack = exports.toSlack = function toSlack(item) {

    return new Promise(function (resolve, reject) {

        (0, _helptos.shortenUrl)(item.url).then(function (url) {
            return resolve('>>>_' + item.date + '_:\n*' + item.title + '*\n\n' + item.description + '\n\n<' + url + '>');
        }).catch(function () {
            return resolve('>>>_' + item.date + '_:\n*' + item.title + '*\n\n' + item.description + '\n\n<' + item.url + '>');
        });
    });
};

/**
 * creates a list of all available categories
 *
 * @returns {string}
 */
var listCategories = exports.listCategories = function listCategories() {
    return 'Available categories:\n' + getNameList(categories);
};