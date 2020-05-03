const Footer = (function () {
    const _Footer = function (el) {
        this.el = el;
    }

    _Footer.prototype.onRender = function onRender () {
        console.log("Footer rendered");
    }

    return _Footer;
})();

module.exports = Footer;