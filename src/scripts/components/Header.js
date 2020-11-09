const BaseView = require("../core/BaseView.js");
const LngMenu = require("./LngMenu.js");


const Header = (function () {

    const Header = BaseView.extend(function (el, template, data) {
        const self = this;
        this.navReset = this.navReset.bind(this);
    });

    Header.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Header.prototype.onRender = function onRender () {
        const self = this;
        Array.apply(null, this.el.getElementsByClassName("header__link")).forEach((link, i) => {
            link.addEventListener("click", function (ev) {
                window.scrollTo({
                    top: document.getElementById(link.getAttribute("link")).offsetTop,
                    behavior: ev.detail.smooth === false ? "auto" : "smooth"
                });
                self.turnDark(self.data.sections.map(d => d.id).indexOf(link.getAttribute("link")) != 0);
                self.app.router.silent(self.app.router.generate("home-section", {
                    section: link.getAttribute("link")
                }));
            });
        });
        this.el.querySelector(".header__icon").addEventListener("click", this.navReset);
        fetch(_env.publicURL + "templates/components/lng-menu.html")
            .then(res => {
                res.text().then(template => {
                    self.lngMenu = new LngMenu(
                        self.el.querySelector(".header__lng-menu"),
                        template,
                        {
                            app: self.app
                        }
                    );
                    self.lngMenu.render();
                });
            });
    };

    Header.prototype.setSections = function setSection (sections) {
        this.data.sections = sections;
    };

    Header.prototype.turnDark = function turnDark (bool) {
        this.el.classList[bool === true ? "add" : "remove"]("dark");
    };

    Header.prototype.navReset = function navReset () {
        this.app.router.navigate("#home/cover");
    };

    return Header;
})();

module.exports = Header;
