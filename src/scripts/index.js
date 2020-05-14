// VENDOR
const Navigo = require("navigo");

// SOURCE
const Injector = require("./Injector.js");

// COMPONENTS
const Header = require("./components/Header.js");
const Footer = require("./components/Footer.js");

// VIEWS
const Home = require("./views/Home.js");
const Project = require("./views/Project.js");
const Documents = require("./views/Documents.js");


window.addEventListener("DOMContentLoaded" , function () {
    const injector = new Injector();
    const router = new Navigo(null, true, "#");

    router.on(function () {
        window.location.hash = "home";
    }).resolve();

    router.on("home", function () {
        injector.load("home.html").then(res => {
            const el = document.getElementById("content");
            injector.render(el, res);
            new Home(el).onRender();
        });
    }).resolve();

    router.on("project", function () {
        injector.load("project.html").then(res => {
            const el = document.getElementById("content");
            injector.render(el, res);
            new Project(el).onRender();
        });
    }).resolve();

    router.on("documents", function () {
        injector.load("documents.html").then(res => {
            const el = document.getElementById("content");
            injector.render(el, res);
            new Documents(el).onRender();
        });
    }).resolve();

    injector.load("header.html").then(res => {
        const el = document.getElementsByTagName("header")[0];
        injector.render(el, res);
        new Header(el).onRender();

    });
    injector.load("footer.html").then(res => {
        const el = document.getElementsByTagName("footer")[0];
        injector.render(el, res);
        new Footer(el).onRender();
    });
});