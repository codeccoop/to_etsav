const BaseView = require("../core/BaseView.js");

const LngMenu = (function () {
    // PRIVATE CODE BLOCK

    // PUBLIC CLASS
    const LngMenu = BaseView.extend(function () {
        this.data.languages = [
            {
                id: "en",
                name: "English"
            },
            {
                id: "ca",
                name: "Català"
            },
            {
                id: "es",
                name: "Español"
            }
        ];
        this.onClickItem = this.onClickItem.bind(this);
        this.render();
    });

    LngMenu.prototype.onRender = function () {
        for (let item of this.el.querySelectorAll(".lng-menu__list-item")) {
            item.addEventListener("click", this.onClickItem);
        }
    };

    LngMenu.prototype.onClickItem = function onClickItem (ev) {
        this.el.querySelector(".lng-menu__visible").innerText = ev.currentTarget.innerText;
    };

    return LngMenu;
})();

module.exports = LngMenu;
