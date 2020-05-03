// import Injector from './scripts/injector.js';
const Injector = require("./scripts/Injector.js");
const Navigo = require("navigo");


window.addEventListener("DOMContentLoaded" , function () {
    const injector = new Injector();
    const router = new Navigo(null, true, "#");

    router.on(function () {
        window.location.hash = "home";
    }).resolve();

    router.on("home", function () {
        injector.load("home.html").then(res => {
            document.getElementById("content").innerHTML = res;
        });
    }).resolve();

    router.on("about", function () {
        injector.load("about.html").then(res => {
            document.getElementById("content").innerHTML = res;
        });
    }).resolve();
});