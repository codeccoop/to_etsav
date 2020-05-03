// VENDOR
const Navigo = require("navigo");

// SOURCE
const Injector = require("./scripts/Injector.js");

// COMPONENTS
const Header = require("./scripts/components/header.js");


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

    router.on("project", function () {
        injector.load("project.html").then(res => {
            document.getElementById("content").innerHTML = res;
        });
    }).resolve();

    router.on("documents", function () {
        injector.load("documents.html").then(res => {
            document.getElementById("content").innerHTML = res;
        });
    }).resolve();

    injector.load("header.html").then(res => {
        const el = document.getElementsByTagName("header")[0];
        el.innerHTML = res;
        new Header(el);
    });
    injector.load("footer.html").then(res => {
        document.getElementsByTagName("footer")[0].innerHTML = res;
    });
});