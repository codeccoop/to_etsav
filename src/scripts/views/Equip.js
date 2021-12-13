const BaseView = require("../core/BaseView.js");


const Equip = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Equip = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "equip_images.json").then(function (response) { 
            const data = JSON.parse(response);
            data.images.forEach(img => img.file = _env.publicURL + "images/equip/" + img.file);
            data.images2.forEach(img => img.file = _env.publicURL + "images/equip/col·laboradors/" + img.file);
            self.data = data;
        });
    };

    Equip = BaseView.extend(Equip);

    Equip.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Equip.prototype.onRender = function onRender () {
        const self = this;
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.addEventListener("click", self.onClickImage);
        }
    };

    Equip.prototype.beforeRemove = function onRemove () {
        for (let img of this.el.querySelectorAll(".img-row")) {
            img.removeEventListener("click", this.onClickImage);
        }
    };

    Equip.prototype.onClickImage = function (ev) {
        const carouselImages = document.querySelector('.img-row')
    };

    return Equip;
})();

module.exports = Equip;
