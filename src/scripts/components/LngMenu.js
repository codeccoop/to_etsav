const BaseView = require("../core/BaseView.js");

const LngMenu = (function () {
    // PRIVATE CODE BLOCK

    // PUBLIC CLASS
    const LngMenu = BaseView.extend(function (el, template, data) {
        this.lng = data.lng;
        const languages = new Array();
        for (let dict of this.lng.dictionaries.entries()) {
            languages.push({
                id: dict[0],
                name: this.lng.translate(dict[0])
            });
        }
        this.data.languages = languages;
        this.onClickItem = this.onClickItem.bind(this);
        this.render();
        const currentLanguage = this.data.languages.filter(lng => {
            return lng.id == this.lng.currentLanguage;
        }).pop();
        this.el.querySelector(".lng-menu__visible").innerText = currentLanguage.name;
    });

    LngMenu.prototype.onRender = function () {
        for (let item of this.el.querySelectorAll(".lng-menu__list-item")) {
            item.addEventListener("click", this.onClickItem);
        };
    };

    LngMenu.prototype.onClickItem = function onClickItem (ev) {
        this.el.querySelector(".lng-menu__visible").innerText = ev.currentTarget.innerText;
        this.lng.currentLanguage = ev.currentTarget.id;
    };

    return LngMenu;
})();

module.exports = LngMenu;
