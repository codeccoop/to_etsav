const BaseView = require("../../core/BaseView.js");


const Project = (function() {
    const Project = BaseView.extend(function Project(el) {
        const self = this;
        this.render();
    });

    Project.prototype.onRender = function onRender() {
    };

    Project.prototype.onRemove = function onRemove() {
    };

    Project.id = "project";
    return Project;
})();

module.exports = Project;
