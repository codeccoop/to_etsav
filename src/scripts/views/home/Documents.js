const BaseView = require("../../core/BaseView.js");


const Documents = (function() {
    const Documents = BaseView.extend(function Documents(el) {
        const self = this;
        this.render();
    });

    Documents.prototype.onRender = function onRender() {
        console.log("Documents rendered");
    };

    Documents.prototype.onRemove = function onRemove() {
        console.log("Documents removed");
    };

    Documents.id = "documents";
    return Documents;
})();

module.exports = Documents;
