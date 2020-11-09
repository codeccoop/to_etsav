const BaseView = require("../core/BaseView.js");


const Gallery = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Gallery = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "gallery_images.json").then(function (response) { 
            self.data = JSON.parse(response);
        });
        this.app.header.setSections([]);
    };

    Gallery = BaseView.extend(Gallery);

    Gallery.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Gallery.prototype.onRender = function onRender () {
        const self = this;
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.addEventListener("click", self.onClickImage);
        }
    };

    Gallery.prototype.onRemove = function onRemove () {
        const self = this;
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.removeEventListener("click", self.onClickImage);
        }
    };

    Gallery.prototype.onClickImage = function (ev) {
        console.log("Has clicat sobre una imàtge!");
    };

    return Gallery;
})();

module.exports = Gallery;
