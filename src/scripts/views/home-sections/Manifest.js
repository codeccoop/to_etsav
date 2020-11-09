const BaseView = require("../../core/BaseView.js");


const Manifest = (function () {
    const Manifest = BaseView.extend(function Manifest (el) {
        const self = this;
        fetch(_env.apiURL + "manifest.json").then(function (res) {
            res.json().then(function (data) {
                self.data = data;
            });
        });
    });

    Manifest.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Manifest.prototype.beforeRender = function beforeRender () {
        var css = "";
        this.data.principles.forEach(function (principle) {
            css += `#manifest .manifest__principle[principle=${principle.id}] .manifest__principle-image {
                background-image: url(${_env.publicURL}images/home-sections/${principle.image});
            }`;
        });
        const style = document.createElement("style");
        style.id = "manifestStyle";
        style.innerHTML = css;
        document.head.appendChild(style);
    };

    Manifest.prototype.onRender = function onRender () {
    };

    Manifest.prototype.beforeRemove = function beforeRemove () {
        const style = document.getElementById("manifestStyle");
        style.parentElement.removeChild(style);
    };

    Manifest.id = "manifest";
    return Manifest;
})();

module.exports = Manifest;
