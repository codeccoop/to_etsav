const Project = (function () {
    const _Project = function (el) {
        this.el = el;
    }

    _Project.prototype.onRender = function onRender () {
        console.log("Project rendered");
    }

    return _Project;
})();

module.exports = Project;