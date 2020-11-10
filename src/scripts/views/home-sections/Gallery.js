const BaseView = require("../../core/BaseView.js");


const Gallery = (function() {
    const Gallery = BaseView.extend(function Gallery(el) {
        const self = this;
        this.goToGallery = this.goToGallery.bind(this);
        this.render();
    });

    Gallery.prototype.onRender = function onRender() {
        this.el.querySelector(".nav-pannel__btn span")
            .addEventListener("click", this.goToGallery);
    };

    Gallery.prototype.beforeRemove = function onRemove() {
        this.el.querySelector(".nav-pannel__btn span")
            .removeEventListener("click", this.goToGallery);
    };

    Gallery.prototype.goToGallery = function goToGallery () {
        console.log("hello");
        this.app.router.navigate("#gallery");
    };

    Gallery.id = "gallery";
    return Gallery;
})();

module.exports = Gallery;
