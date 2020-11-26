const BaseView = require("../../core/BaseView.js");


const Documents = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Documents = function (el, template) {
        const self = this;
        this.onClickMain = this.onClickMain.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onClickDocument = this.onClickDocument.bind(this);

        this.load(_env.apiURL + "documents.json").then(function (response) {
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
        for (let doc of self.el.querySelectorAll(".has_file")) {
            doc.addEventListener("click", self.onClickDocument);
        }
        for (let doc of self.el.querySelectorAll(".doc-col-main")) {
            doc.addEventListener("mouseover", self.onClickMain);
        }
        console.log("Documents rendered");
    };

    Documents.prototype.beforeRemove = function beforeRemove () {
        for (let doc of this.el.querySelectorAll(".doc-row")) {
            doc.removeEventListener("mouseover", self.onClickDocument);
        }
        console.log("Documents removed");
    };

    Documents.prototype.onClickDocument = function (ev) {
        window.open("public/data/" + ev.currentTarget.dataset.file);
        document.getElementsByClassName('.doc-col-main').style.display = 'block';
    };

    Documents.prototype.onClickMain = function (ev) {
        ev.currentTarget.style.display = 'None' ;
        subs=ev.currentTarget.parentElement.getElementsByClassName("has_file");
        for (let sub of subs){
              sub.style.display = 'block';
              sub.style.borderColor = '#67A64B';
		    }
        ev.currentTarget.parentElement
            .addEventListener("mouseleave",this.onMouseLeave);
    };

    Documents.prototype.onMouseLeave = function (ev) {
        ev.currentTarget.getElementsByClassName("has_file");
        for (let sub of subs) {
              sub.style.display = 'none';
		    }
        ev.currentTarget
            .getElementsByClassName("doc-col-main")[0].style.display = "block";
        ev.currentTarget
            .removeEventListener("mouseleave",this.onMouseLeave);
    };

    return Documents;
})();

module.exports = Documents;
