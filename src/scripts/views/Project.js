const BaseView = require("../core/BaseView.js");


const Project = (function () {
    const Project = BaseView.extend(function Project (el) {
        const self = this;
        this.render();
    });

    Project.prototype.onUpdate = function onUpdate () {
        console.log("Project updated");
    };

    Project.prototype.onRender = function onRender () {
        console.log("Project rendered");
    };

    Project.prototype.onRemove = function onRemove () {
        console.log("Project removed");
    };

    return Project;
})();

module.exports = Project;
