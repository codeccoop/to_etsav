const BaseView = require("../../core/BaseView.js");


const Project = (function() {
    const Project = BaseView.extend(function Project(el) {
        const self = this;
        this.render();
    });

    Project.prototype.onRender = function onRender() {
        console.log("Project rendered");
    };

    Project.prototype.onRemove = function onRemove() {
        console.log("Project removed");
    };

    Project.id = "project";
    return Project;
})();

module.exports = Project;
