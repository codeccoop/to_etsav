const BaseView = require("../core/BaseView.js");


const Gallery = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Gallery = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "gallery_images.json").then(function (response) {
            const data = JSON.parse(response);
            data.images = data.images.map(img => {
                img["thumbnail"] = img["file"].replace(/\.(jpg|png|jpeg)/, "--small." + img.file.match(/\.([a-zA-Z]*$)/)[1]);
                return img;
            });
            self.data = data;
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
        this.app.header.addClass("green", true);
        this.app.header.addClass("breadcrumb", true);
        this.app.header.setSections([{id: "gallery"}]);
    };

    Gallery.prototype.beforeRemove = function onRemove () {
        const self = this;
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.removeEventListener("click", self.onClickImage);
        }
    };

    Gallery.prototype.onClickImage = function (ev) {
        console.log("Has clicat sobre una imàtge!");
        const ruta = img.getAttribute('src');
        overlay.classList.add('activo');
        document.querySelector('#overlay img').src = ruta;
		    document.querySelector('#overlay .description').innerHTML = description;
    };

    return Gallery;
})();

module.exports = Gallery;
