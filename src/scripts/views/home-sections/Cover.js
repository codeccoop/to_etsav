const BaseView = require("../../core/BaseView.js");


const Cover = (function() {
    const Cover = BaseView.extend(function Cover(el) {
        const self = this;
        this.render();
    });

    return Cover;
})();

module.exports = Cover;
