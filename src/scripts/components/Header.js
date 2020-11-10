const BaseView = require("../core/BaseView.js");
const LngMenu = require("./LngMenu.js");


const Header = (function () {

    const Header = BaseView.extend(function (el, template, data) {
        const self = this;
        this.navReset = this.navReset.bind(this);
        this.updateLayout = this.updateLayout.bind(this);
    });

    Header.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Header.prototype.beforeRender = function beforeRender () {
        this.app.scroll.on("update:section", this.updateLayout);
    };

    Header.prototype.onRender = function onRender () {
        const self = this;
        Array.apply(null, this.el.getElementsByClassName("header__link")).forEach((link, i) => {
            link.addEventListener("click", function (ev) {
                window.scrollTo({
                    top: document.getElementById(link.getAttribute("link")).offsetTop,
                    behavior: ev.detail.smooth === false ? "auto" : "smooth"
                });
                self.updateLayout(self.data.sections.map(d => d.id).indexOf(link.getAttribute("link")));
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

    Header.prototype.onRemove = function onRemove () {
        this.app.scroll.off("update:section", this.updateLayout);
    };

    Header.prototype.setSections = function setSection (sections) {
        this.data.sections = sections;
    };

    Header.prototype.updateLayout = function updateLayout (section) {
        this.addClass("dark", [1, 3, 5, 6, 7].indexOf(section) != -1);
        this.addClass("green", [3].indexOf(section) != -1);
        Array.apply(null, this.el.querySelectorAll(".header__link"))
            .forEach(function (el, i) {
                el.classList[i % 7 === section ? "add" : "remove"]("active");
            });
    };

    Header.prototype.addClass = function turnDark (val, bool) {
        this.el.classList[bool === true ? "add" : "remove"](val);
    };

    Header.prototype.navReset = function navReset () {
        this.app.router.navigate("#home/cover");
    };

    return Header;
})();

module.exports = Header;
