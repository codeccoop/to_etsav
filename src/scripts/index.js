// SOURCE
const Router = require("./core/Router.js");


window.addEventListener("DOMContentLoaded" , function () {
    const router = new Router();

    router.on(function () {
        window.location.hash = "home";
    }).resolve();
});