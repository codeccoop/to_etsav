const BaseView = require("../core/BaseView.js");


const Header = (function () {

    const Header = BaseView.extend(function (el, template) {
        const self = this;
        this.render();
    });

    Header.prototype.onRender = function onRender () {
        Array.apply(null, this.el.getElementsByClassName("header__link")).forEach(link => {
            link.addEventListener("click", function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                location.hash = this.children[0].getAttribute("href");
            });
        });
    }

    return Header;
})();

module.exports = Header;