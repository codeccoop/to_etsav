const BaseView = require("../core/BaseView.js");


const Documents = (function () {
    const Documents = BaseView.extend(function (el, template) {
        const self = this;
        this.load("data/documents.json", function (response) {
            self.data = JSON.parse(response);
        });
    });

    Documents.prototype.onUpdate = function onUpdate () {
        console.log("Documents updated");
        this.render();
    }

    Documents.prototype.onRender = function onRender () {
        console.log("Documents rendered");
    }

    Documents.prototype.onRemove = function onRemove () {
        console.log("Documents removed");
    }

    return Documents;
})();

module.exports = Documents;