const BaseView = require("../core/BaseView.js");
const LngMenu = require("./LngMenu.js");


const Header = (function () {

    const Header = BaseView.extend(function (el, template, sections) {
        const self = this;
        this.data.sections = sections;
        fetch(_env.publicURL + "templates/components/lng-menu.html").then(res => {
            res.text().then(template => {
                self.render();
                self.lngMenu = new LngMenu(self.el.querySelector(".header__lng-menu"), template);
            });
        });
    });

    Header.prototype.onRender = function onRender () {
        Array.apply(null, this.el.getElementsByClassName("header__link")).forEach(link => {
            link.addEventListener("click", function (ev) {
                window.scrollTo({
                    top: document.getElementById(link.getAttribute("link")).offsetTop,
                    behavior: "smooth"
                });
            });
        });
    };

    return Header;
})();

module.exports = Header;
