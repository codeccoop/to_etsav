const Router = require("./router/Router.js");

module.exports = function startApp () {
    new Router().on(function () {
        window.location.hash = "home";
    }).resolve();
}
