const BaseView = require("../core/BaseView.js");


const Equip = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Equip = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "equip_images.json").then(function (response) { 
            self.data = JSON.parse(response);
        });
    };

    Equip = BaseView.extend(Equip);

    Equip.prototype.onUpdate = function onUpdate () {
        console.log("Equip updated");
        this.render();
    };

    Equip.prototype.onRender = function onRender () {
        const self = this;
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.addEventListener("click", self.onClickImage);
        }
        console.log("Equip rendered");
    };

    Equip.prototype.beforeRemove = function onRemove () {
        for (let img of this.el.querySelectorAll(".img-row")) {
            img.removeEventListener("click", this.onClickImage);
        }
        console.log("Equip removed");
    };

    Equip.prototype.onClickImage = function (ev) {
        console.log("Has clicat sobre una imàtge!");
        const carouselImages = document.querySelector('.img-row')
    };

    return Equip;
})();

module.exports = Equip;
