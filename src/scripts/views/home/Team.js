const BaseView = require("../../core/BaseView.js");


const Team = (function() {
    const Team = BaseView.extend(function Team(el) {
        const self = this;
        this.render();
    });

    Team.prototype.onRender = function onRender() {
        console.log("Team rendered");
    };

    Team.prototype.onRemove = function onRemove() {
        console.log("Team removed");
    };

    Team.id = "team";
    return Team;
})();

module.exports = Team;
