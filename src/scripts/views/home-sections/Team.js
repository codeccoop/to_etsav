const BaseView = require("../../core/BaseView.js");


const Team = (function() {
    const Team = BaseView.extend(function Team (el) {
        const self = this;
        this.goToTeam = this.goToTeam.bind(this);
        this.render();
    });

    Team.prototype.onRender = function onRender () {
        this.el.querySelector(".nav-pannel__btn span")
            .addEventListener("click", this.goToTeam);
    };

    Team.prototype.beforeRemove = function onRemove () {
        this.el.querySelector(".nav-pannel__btn span")
            .removeEventListener("click", this.goToTeam);
    };

    Team.prototype.goToTeam = function goToTeam () {
        this.app.router.navigate(this.app.router.generate("team"));
        this.app.header.setSections([]);
    };

    return Team;
})();

module.exports = Team;
