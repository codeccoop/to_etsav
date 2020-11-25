const BaseView = require("../../core/BaseView.js");


const Sponsors = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Sponsors = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "patrocinadors_images.json")
            .then(function (response) {
                self.data = JSON.parse(response);
            });
    };

    Sponsors = BaseView.extend(Sponsors);

    Sponsors.prototype.onUpdate = function onUpdate () {
        console.log("Sponsors updated");
        this.render();
    };

    Sponsors.prototype.onRender = function onRender () {
        const self = this;
        for (let img of self.el.querySelectorAll("")) {
            img.addEventListener("click", self.onClickImage);
        }
        console.log("Equip rendered");
    };

    Sponsors.prototype.onRemove = function onRemove () {
        for (let img of self.el.querySelectorAll("")) {
            img.removeEventListener("click", self.onClickImage);
        }
        console.log("Equip removed");
    };

    Sponsors.prototype.onClickImage = function (ev) {
        console.log("Has clicat sobre una imàtge!");
        const carouselImages = document.querySelector('');
    };

    return Sponsors;
})();

module.exports = Sponsors;
