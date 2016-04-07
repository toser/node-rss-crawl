"use strict";

import feedparser from 'feedparser-promised';
import moment from 'moment';
import striptags from 'striptags';
import {getConfig, hasAllPropsSet, getRandomEntry, shortenUrl, getFirstByName} from 'helptos';

/**
 * get rss url form array of categories by category name
 *
 * @param categories
 * @param category
 * @returns {*}
 */
let getRssUrl = (categories, category) => {

    let el = getFirstByName(categories, category),
        output = false;

    if (el && el.url) {
        output = el.url;
    }

    return output;
};

const configFile = '../config/news.json';
let categories = getConfig(configFile).categories.filter(category => hasAllPropsSet(['name', 'url'])(category));
moment.locale('de');

/**
 *
 *
 * @param category
 * @param callback
 * @returns {Promise}
 */
export let loadNews = (category = 'alles', callback) => {

    return new Promise((resolve, reject) => {

        const rssURL = getRssUrl(categories, category);

        if (!rssURL) {
            reject(
                `Category "${category}" not found.\nAvailable categories:\n${getNameList(categories)}`);
        }

        feedparser
            .parse(rssURL)
            .then((items) => {

                resolve(
                    items.map(item => ({
                        date: moment(item.pubDate).fromNow(),
                        title: item.title,
                        url: item.link,
                        description: striptags(item.description).replace(/(\r\n|\n|\r)/gm, "")
                    }))
                );
            })
            .catch((error) => {
                reject(`error: ${error}`);
            });

    });
};

/**
 * get a random post
 *
 * @param items
 */
export let getRandomPost = (items) => getRandomEntry(items);

/**
 * converts news item to a slack message
 *
 * @param item
 * @returns {Promise}
 */
export let toSlack = (item) => {

    return new Promise((resolve, reject) => {

        shortenUrl(item.url)
            .then(url => resolve(`>>>_${item.date}_:\n*${item.title}*\n\n${item.description}\n\n<${url}>`))
            .catch(() => resolve(`>>>_${item.date}_:\n*${item.title}*\n\n${item.description}\n\n<${item.url}>`));
    });
};

/**
 * creates a list of all available categories
 *
 * @returns {string}
 */
export let listCategories = () => `Available categories:\n${getNameList(categories)}`;