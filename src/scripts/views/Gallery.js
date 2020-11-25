const BaseView = require("../core/BaseView.js");


const Gallery = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Gallery = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "gallery_images.json").then(function (response) { 
            var data = JSON.parse(response);
            data.rows = [];
            var rowindex = -1;
            var index = 0;
            for (let img of data.images){
                if (index % 3 == 0) {
                    data.rows.push({images: []});
                    rowindex++;
                }
                img.id = "imatge" + index;
                img.smallfile = img.file.split(".")[0]+"--small."+img.file.split(".")[1]
                data.rows[rowindex].images.push(img);
                index = index + 1;
            }
            self.data = data;
        });
        this.onClickImage = this.onClickImage.bind(this);
        this.onCloseOverlay = this.onCloseOverlay.bind(this);
    };

    Gallery = BaseView.extend(Gallery);

    Gallery.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Gallery.prototype.onRender = function onRender () {
        const self = this;
        for (let img of self.el.querySelectorAll(".img-container img")) {
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
        var overlay = document.querySelector('.overlay');
        overlay.classList.add('activo');
        if (!this.glider) {
            new Glider(overlay.querySelector('.glider-images'), {
                slidesToShow: 1,
                dots: '.dots',
                draggable: true,
                itemWidth: 50,
                rewind: true,
                arrows: {
                    prev: '.glider-prev',
                    next: '.glider-next'
                }
            });
        } else {
            this.glider.refresh();
        }
        var boton = document.querySelector('#boton-cerrar');
        boton.addEventListener('click', this.onCloseOverlay);
        overlay.addEventListener('click', this.onCloseOverlay);
    };

    Gallery.prototype.onCloseOverlay = function onCloseOverlay (ev) {
        var overlay = document.querySelector('.overlay');
        var boton = document.querySelector('#boton-cerrar');
        if (overlay === ev.target || ev.target.id == "boton-cerrar") {
            overlay.classList.remove('activo');
            boton.removeEventListener('click', this.onCloseOverlay);
            overlay.removeEventListener('click', this.onCloseOverlay);
        }
        this.glider = null;
    };

    return Gallery;
})();

module.exports = Gallery;
