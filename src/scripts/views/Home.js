const BaseView = require("../core/BaseView.js");


const Home = (function () {
    const Home = BaseView.extend(function (el, template) {
        const self = this;
        this.render();
    });

    Home.prototype.onUpdate = function onUpdate () {
        console.log("Home updated");
    }

    Home.prototype.onRender = function onRender () {
        console.log("Home rendered");
    }

    Home.prototype.onRemove = function onRemove () {
        console.log("Home removed");
    }

    return Home;
})();

module.exports = Home;