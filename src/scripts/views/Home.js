const Home = (function () {
    const _Home = function (el) {
        this.el = el;
    }

    _Home.prototype.onRender = function onRender () {
        console.log("Home rendered");
    }

    return _Home;
})();

module.exports = Home;