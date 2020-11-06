const BaseView = require("../../core/BaseView.js");


const Manifest = (function() {
    const Manifest = BaseView.extend(function Manifest(el) {
        const self = this;
        this.render();
    });

    Manifest.prototype.onRender = function onRender() {
        console.log("Manifest rendered");
    };

    Manifest.prototype.onRemove = function onRemove() {
        console.log("Manifest removed");
    };

    Manifest.id = "manifest";
    return Manifest;
})();

module.exports = Manifest;
