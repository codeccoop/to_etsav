const BaseView = require("../core/BaseView.js");


const Footer = (function () {
    const Footer = BaseView.extend(function (el, template) {
        const self = this;
        this.render();
    });

    Footer.prototype.onRender = function onRender () {
        // TO OVERWRITE
    }

    return Footer;
})();

module.exports = Footer;