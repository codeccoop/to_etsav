const BaseView = require("../core/BaseView.js");


const Patrocinadors = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Patrocinadors = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "patrocinadors_images.json").then(function (response) { 
            self.data = JSON.parse(response);
        });
    };

    Patrocinadors = BaseView.extend(Equip);

    Patrocinadors.prototype.onUpdate = function onUpdate () {
        console.log("Equip updated");
        this.render();
    };

    Patrocinadors.prototype.onRender = function onRender () {
        const self = this;
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.addEventListener("click", self.onClickImage);
        }
        console.log("Equip rendered");
    };

    Patrocinadors.prototype.onRemove = function onRemove () {
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.removeEventListener("click", self.onClickImage);
        }
        console.log("Equip removed");
    };

    Patrocinadors.prototype.onClickImage = function (ev) {
        console.log("Has clicat sobre una imàtge!");
        const carouselImages = document.querySelector('.img-row')
    };

    return Patrocinadors;
})();

module.exports = Patrocinadors;