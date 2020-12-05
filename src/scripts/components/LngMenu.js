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
        this.data.currentLanguage = this.data.languages.filter(lng => {
            return lng.id == this.app.lng.currentLanguage;
        }).pop() || "en";
        this.onClickItem = this.onClickItem.bind(this);
        this.render();
    });

    LngMenu.prototype.onRender = function () {
        this.el.setAttribute("lang", this.data.currentLanguage.id);
        for (let item of this.el.querySelectorAll(".lng-menu__list-item")) {
            item.addEventListener("click", this.onClickItem);
        };
    };

    LngMenu.prototype.onClickItem = function onClickItem (ev) {
        this.app.lng.currentLanguage = ev.currentTarget.getAttribute("lang");
    };

    return LngMenu;
})();

module.exports = LngMenu;
