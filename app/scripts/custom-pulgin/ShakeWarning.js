/**
 * The plugin to shake for warning over the content.
 */
module.exports = {

    /**
     * To shake for warning.
     * @param id    the id of content , with '#'
     */
    isWarning(id) {
        $(id).removeClass('shake-normal');
        setTimeout(() => {
            $(id).addClass('shake-normal');
        }, 0);
    },

    /**
     * To hide warning.
     * @param id    the id of content , with '#'
     */
    hideWarning(id) {
        $(id).removeClass('shake-normal');
    },

};