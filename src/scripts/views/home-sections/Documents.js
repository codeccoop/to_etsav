const BaseView = require("../../core/BaseView.js");


const Documents = (function() {
    const Documents = BaseView.extend(function Documents(el) {
        const self = this;
        this.render();
    });

    Documents.prototype.onRender = function onRender() {
    };

    Documents.prototype.onRemove = function onRemove() {
    };

    Documents.id = "documents";
    return Documents;
})();

module.exports = Documents;
