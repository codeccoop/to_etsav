const BaseView = require("../../core/BaseView.js");


const Gallery = (function() {
    const Gallery = BaseView.extend(function Gallery(el) {
        const self = this;
        this.render();
    });

    Gallery.prototype.onRender = function onRender() {
        console.log("Gallery rendered");
    };

    Gallery.prototype.onRemove = function onRemove() {
        console.log("Gallery removed");
    };

    Gallery.id = "gallery";
    return Gallery;
})();

module.exports = Gallery;
