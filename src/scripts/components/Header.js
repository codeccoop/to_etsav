const BaseView = require("../core/BaseView.js");
const LngMenu = require("./LngMenu.js");


const Header = (function () {

    const Header = BaseView.extend(function (el, template, data) {
        const self = this;
        this.navReset = this.navReset.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onClickLink = this.onClickLink.bind(this);
        this.data.sections = data.sections || [];
    });

    Header.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Header.prototype.beforeRender = function beforeRender () {
        this.app.scroll.on("update:section", this.onScroll);
    };

    Header.prototype.onRender = function onRender () {
        const self = this;
        Array.apply(null, this.el.getElementsByClassName("header__link"))
            .forEach(link => link.addEventListener("click", this.onClickLink));
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

        this.el.querySelector(".header__nav-btn")
            .addEventListener("click", this.onBreadcrumb);
    };

    Header.prototype.beforeRemove = function beforeRemove () {
        this.el.querySelector(".header__nav-btn")
            .removeEventListener("click", this.onBreadcrumb);
        Array.apply(null, this.el.getElementsByClassName("header__link"))
            .forEach(link => link.removeEventListener("click", this.onClickLink));

    };

    Header.prototype.onRemove = function onRemove () {
        this.app.scroll.off("update:section", this.onScroll);
    };

    Header.prototype.setSections = function setSection (sections) {
        const change = this.data.sections.length != sections.length || !this.data.sections
              .reduce(function (acum, section, i) {
                  return acum && section.id == sections[i].id;
              }, true);
        if (change) this.data.sections = sections;
    };

    Header.prototype.onNavigate = function onNavigate () {
        const isHome = this.app.router.lastRouteResolved().name.indexOf("home") > -1;
        if (isHome) {
            this.setSections(this.app.homeSections);
        } else {
            this.setSections([{id: this.app.router.lastRouteResolved().name}]);
            this.addClass("dark", true);
        }
        this.addClass("breadcrumb", !isHome);
    };

    Header.prototype.onScroll = function onScroll (section) {
        this.addClass("dark", [1, 5, 6, 7].indexOf(section) != -1);
        this.addClass("green", [3, 5, 6].indexOf(section) != -1);
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

    Header.prototype.onBreadcrumb = function onBreadcrumb () {
        history.back();
    };

    Header.prototype.onClickLink = function onClickLink (ev) {
        this.app.scroll.currentSection = this.data.sections
            .map(d => d.id).indexOf(ev.srcElement.getAttribute("link"));
        window.scrollTo({
            top: document.getElementById(ev.srcElement.getAttribute("link")).offsetTop,
            behavior: ev.detail.smooth === false ? "auto" : "smooth"
        });
        this.app.router.silentNavigation(this.app.router.generate("home-section", {
            section: ev.srcElement.getAttribute("link")
        }));
    };

    return Header;
})();

module.exports = Header;
