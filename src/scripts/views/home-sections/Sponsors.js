const BaseView = require("../../core/BaseView.js");


const Sponsors = (function() {
    const Sponsors = BaseView.extend(function Sponsors(el) {
        const self = this;
        this.render();
    });

    Sponsors.prototype.onRender = function onRender() {
    };

    Sponsors.prototype.onRemove = function onRemove() {
    };

    Sponsors.id = "sponsors";
    return Sponsors;
})();

module.exports = Sponsors;
