'use strict';
import 'whatwg-fetch';

/**
 * Escape character for url
 *
 * @param {String} character
 * @returns {*}
 */
const escapeCharacter = function escapeCharacter(character) {
    switch (character) {
        case ' ':
            return '+';
        case '+':
        case '/':
        case '?':
        case '#':
        case '&':
        case '=':
            return '%' + parseInt(character.charCodeAt(0), 16);
        default:
            return character;
    }
};

/**
 * url converter
 *
 * @param {String} url
 * @param {Object} params
 */
const urlConverter = function urlConverter(url, params) {
    let result = '';
    if (url) {
        result = url;
        let paramArr = [];
        for (let prop in params) {
            if (params.hasOwnProperty(prop)) {
                let value = '';
                if (typeof params[prop] !== 'undefined') {
                    if (typeof params[prop] === 'string') {
                        for (let i = 0; i < String(params[prop]).length; i++) {
                            value += escapeCharacter(params[prop][i]);
                        }
                    } else {
                        value += params[prop]
                    }
                    paramArr.push(prop + '=' + value);
                }
            }
        }
        if (paramArr.length > 0) {
            result += '?';
            result += paramArr.join('&');
        }
    }
    return result;
};

/**
 * Error Process
 *
 */
const errorProcess = {
    /**
     * Error Throw Function
     *
     * @param response
     */
    throw(response){
        let error = new Error(response.status);
        error.response = response;
        throw error
    },
    /**
     * Default Error Catch Function
     *
     * @param error
     * @param url
     */
    catch(error, url){
        let response = error.response;
        console.error('Request Fail! ' + response.status + ' ' + response.statusText + ' ' + url);
        response.json().then(data => console.warn(data))
    },
};

/**
 * Response Process
 *
 * @param {Object} response
 * @param {String} url
 * @param {Function} callback
 * @param {Function} errorCatch
 */
const responseProcess = (response, url, callback, errorCatch = errorProcess.throw) => {
    try {
        if (response.ok) {
            /*
             It's odd that response.json() throws a error when the response is empty rather than return a {}.
             */
            response.text().then(
                data => {
                    if (data) {
                        callback(JSON.parse(data));
                    } else {
                        callback({})
                    }
                }
            )
        } else {
            errorProcess.throw(response)
        }
    } catch (e) {
        errorCatch(e, url, response)
    }
};

/**
 * HttpRequestService
 *
 * This is not suitable for AngularJS because $digest will not be invoked immediately.
 * Use {@link AngularAjaxService} in AngularJS
 *
 * @deprecated
 * @constructor
 * @export
 * @class HttpRequestService
 */
export default class HttpRequestService {
    /**
     * Static POST
     *
     * @param {String} url
     * @param {Object} params
     * @param {Object} requestBody
     * @param {Function} callback
     * @param {Function} errorCatch
     */
    static post(url, params, requestBody, callback, errorCatch) {
        let requestUrl = urlConverter(url, params);
        fetch(requestUrl, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(response => responseProcess(response, url, callback, errorCatch))
        .catch(e => console.error('Request Failed! Please check your url and network.', e))
    }

    /**
     * Static GET
     *
     * @param {String} url
     * @param {Object} params
     * @param {Function} callback
     * @param {Function} errorCatch
     */
    static get(url, params, callback, errorCatch) {
        let requestUrl = urlConverter(url, params);
        fetch(requestUrl, {
            method: 'GET',
        })
            .then(response => responseProcess(response, url, callback, errorCatch))
            .catch(e => console.error('Request Failed! Please check your url and network.', e))
    }

    /**
     * Static PUT
     *
     * @param {String} url
     * @param {Object} params
     * @param {Object} requestBody
     * @param {Function} callback
     * @param {Function} errorCatch
     */
    static put(url, params, requestBody, callback, errorCatch) {
        let requestUrl = urlConverter(url, params);
        fetch(requestUrl, {
            method: 'PUT',
            body: JSON.stringify(requestBody),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then(response => responseProcess(response, url, callback, errorCatch))
            .catch(e => console.error('Request Failed! Please check your url and network.', e))
    }

    /**
     * Static DELETE
     *
     * @param {String} url
     * @param {Object} params
     * @param {Function} callback
     * @param {Function} errorCatch
     */
    static delete(url, params, callback, errorCatch) {
        let requestUrl = urlConverter(url, params);
        fetch(requestUrl, {
            method: 'DELETE',
        })
            .then(response => responseProcess(response, url, callback, errorCatch))
            .catch(e => console.error('Request Failed! Please check your url and network.', e))
    }
}
