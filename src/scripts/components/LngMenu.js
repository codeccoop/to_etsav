const BaseView = require("../core/BaseView.js");

const LngMenu = (function () {
    // PRIVATE CODE BLOCK

    // PUBLIC CLASS
    const LngMenu = BaseView.extend(function (el, template, data) {
        const languages = new Array();
        for (let dict of this.app.lng.dictionaries.entries()) {
            languages.push({
                id: dict[0],
                name: this.app.lng.translate(dict[0])
            });
        }
        this.data.languages = languages;
        this.onClickItem = this.onClickItem.bind(this);
        this.onClickVisible = this.onClickVisible.bind(this);
        this.onClickOut = this.onClickOut.bind(this);
        this.render();
    });

    LngMenu.prototype.onRender = function () {
        for (let item of this.el.querySelectorAll(".lng-menu__list-item")) {
            item.addEventListener("click", this.onClickItem);
        };
        const currentLanguage = this.data.languages.filter(lng => {
            return lng.id == this.app.lng.currentLanguage;
        }).pop();
        const visible = this.el.querySelector(".lng-menu__visible");
        visible.addEventListener("click", this.onClickVisible);
        visible.innerText = currentLanguage.name;
    };

    LngMenu.prototype.onClickItem = function onClickItem (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.el.classList.remove("expanded");
        const visible = this.el.querySelector(".lng-menu__visible");
        visible.addEventListener("click", this.onClickVisible);
        visible.innerText = ev.currentTarget.innerText;
        document.body.removeEventListener("click", this.onClickOut);
        this.app.lng.currentLanguage = ev.currentTarget.id;
    };

    LngMenu.prototype.onClickVisible = function onClickVisible (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.el.classList.add("expanded");
        this.el.querySelector(".lng-menu__visible").removeEventListener("click", this.onClickVisible);
        document.body.addEventListener("click", this.onClickOut);
    };

    LngMenu.prototype.onClickOut = function onClickOut (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        if (!this.el.contains(ev.currentTarget)) this.el.classList.remove("expanded");
        document.body.removeEventListener("click", this.onClickOut);
        this.el.querySelector(".lng-menu__visible").addEventListener("click", this.onClickVisible);
    };

    return LngMenu;
})();

module.exports = LngMenu;
