const Router = (function () {
    const Router = function Router () {
        window.onpopstate = console.log;
    }

    Router.prototype.start = function start () {
        console.log(window.location.hash);
    }

    return Router;
})();

module.exports = Router;