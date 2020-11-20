const BaseView = require("../core/BaseView.js");

const overlay = document.getElementById('overlay');
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
            console.log(data);
            self.data = data;
        });
    };

    Gallery = BaseView.extend(Gallery);

    Gallery.prototype.onUpdate = function onUpdate () {
        console.log("Gallery updated");
        this.render();
    };

    Gallery.prototype.onRender = function onRender () {
        const self = this;
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.addEventListener("click", self.onClickImage);
        }
        console.log("Gallery rendered");
    };

    Gallery.prototype.onRemove = function onRemove () {
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.removeEventListener("click", self.onClickImage);
        }
        console.log("Gallery removed");
    };
    
    Gallery.prototype.onClickImage = function (ev) {
        debugger;
        var img = ev.target;
        console.log("Has clicat sobre una imàtge!");
        const ruta = img.getAttribute('src');
        var overlay = document.querySelector('.overlay');
        overlay.classList.add('activo');
        document.querySelector('.overlay img').src = ruta;
        var boton = document.querySelector('#boton-cerrar');
        boton.addEventListener('click', () => {
            overlay.classList.remove('activo');
        });
        overlay.addEventListener('click', (evento) => {
            evento.target.id === 'overlay' ? overlay.classList.remove('activo') : '';
        })
    };
    
    return Gallery;
})();

module.exports = Gallery;
