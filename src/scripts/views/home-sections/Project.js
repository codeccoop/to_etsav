const BaseView = require("../../core/BaseView.js");


const Project = (function() {
    const Project = BaseView.extend(function Project(el) {
        const self = this;
        this.goToProject = this.goToProject.bind(this);
        this.render();
    });

    Project.prototype.onRender = function onRender () {
        this.el.querySelector(".nav-pannel__btn span")
            .addEventListener("click", this.goToProject);
    };

    Project.prototype.beforeRemove = function onRemove () {
        this.el.querySelector(".nav-pannel__btn span")
            .removeEventListener("click", this.goToProject);
    };

    Project.prototype.goToProject = function goToProject () {
        this.app.router.navigate(this.app.router.generate("project"));
        this.app.header.setSections([]);
    };

    return Project;
})();

module.exports = Project;
