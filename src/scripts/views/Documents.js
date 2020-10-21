const BaseView = require("../core/BaseView.js");


const Documents = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Documents = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "documents.json").then(function (response) {
            // this == funció anonima
            // self == Documents
            self.data = JSON.parse(response);
        });
    };

    Documents = BaseView.extend(Documents);

    Documents.prototype.onUpdate = function onUpdate () {
        console.log("Documents updated");
        this.render();
    };

    Documents.prototype.onRender = function onRender () {
        const self = this;
        for (let doc of self.el.querySelectorAll(".doc-row")) {
            doc.addEventListener("click", self.onClickDocument);
        }
        // const list = document.createElement("ul");
        // self.data.forEach(function (doc) {
        //     var link = document.createElement("a");
        //     link.href = "statics/data/" + doc.file;
        //     link.setAttribute("target", "_blank");
        //     var listElement = document.createElement("li");
        //     listElement.innerText = doc.name;
        //     listElement.setAttribute("data-file", doc.file);
        //     link.appendChild(listElement);
        //     list.appendChild(link);
        // });
        // this.el.appendChild(list);
        console.log("Documents rendered");
    };

    Documents.prototype.onRemove = function onRemove () {
        for (let doc of self.el.querySelectorAll(".doc-row")) {
            doc.removeEventListener("click", self.onClickDocument);
        }
        console.log("Documents removed");
    };

    Documents.prototype.onClickDocument = function (ev) {
        window.open("statics/data/" + ev.currentTarget.dataset.file);
    };

    return Documents;
})();

module.exports = Documents;
