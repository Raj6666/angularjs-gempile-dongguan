/**
 * The plugin to show loading over the content.
 */
module.exports = {

    /**
     * To show loading.
     * @param id    the id of content , with '#'
     * @param type  the type of content ['sm' or 'lg'], button use 'sm', default 'lg'
     */
    isLoading(id, type = 'lg') {
        $(id).addClass('ui-loading-' + type);
    },

    /**
     * To hide loading.
     * @param id    the id of content , with '#'
     * @param type  the type of content ['sm' or 'lg'], button use 'sm', default 'lg'
     */
    hideLoading(id, type = 'lg') {
        $(id).toggleClass('ui-loading-' + type, false);
    },

};