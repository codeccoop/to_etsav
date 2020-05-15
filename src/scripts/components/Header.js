const BaseView = require("../core/BaseView.js");


const Header = (function () {

    const Header = BaseView.extend(function (el, template) {
        const self = this;
        this.render();
    });

    Header.prototype.onRender = function onRender () {
        Array.apply(null, this.el.getElementsByClassName("header__link")).forEach(link => {
            link.addEventListener("click", function () {
                // console.log(this);
            });
        });
        console.log("Header rendered");
    }

    return Header;
})();

module.exports = Header;