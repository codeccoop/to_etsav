const BaseView = require("../core/BaseView.js");


const Footer = (function () {
    const Footer = BaseView.extend(function (el, template) {
        const self = this;
        this.render();
    });

    Footer.prototype.onRender = function onRender () {
        console.log("Footer rendered");
    }

    return Footer;
})();

module.exports = Footer;