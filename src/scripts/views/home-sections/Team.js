const BaseView = require("../../core/BaseView.js");


const Team = (function() {
    const Team = BaseView.extend(function Team(el) {
        const self = this;
        this.render();
    });

    Team.prototype.onRender = function onRender() {
    };

    Team.prototype.onRemove = function onRemove() {
    };

    Team.id = "team";
    return Team;
})();

module.exports = Team;
