// VIEWS
const Home = require("../views/Home.js");
const Project = require("../views/Project.js");
const Documents = require("../views/Documents.js");
const Gallery = require("../views/Gallery.js");

module.exports = {
    "home": {
        as: "home",
        uses: {
            el: "#content",
            template: "home.html",
            view: Home
        }
    },
    "home/:section": {
        as: "home-section",
        uses: {
            el: "#content",
            template: "home.html",
            view: Home
        }
    },
    "project": {
        as: "project",
        uses: {
            el: "#content",
            template: "project.html",
            view: Project
        }
    },
    "documents": {
        as: "documents",
        uses: {
            el: "#content",
            template: "documents.html",
            view: Documents
        }
    },
    "gallery": {
        as: "gallery",
        uses: {
            el: "#content",
            template: "gallery.html",
            view: Gallery
        }
    }
}
