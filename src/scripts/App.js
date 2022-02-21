const Lng = require("./utils/Lng.js");
const AppRouter = require("./router/AppRouter.js");
const ScrollHandler = require("./utils/ScrollHandler.js");

// COMPONENTS
const Header = require("./components/Header.js");
const Footer = require("./components/Footer.js");

// VIEWS
const Cover = require("./views/home-sections/Cover.js");
const Manifest = require("./views/home-sections/Manifest.js");
const Project = require("./views/home-sections/Project.js");
const Gallery = require("./views/home-sections/Gallery.js");
const Team = require("./views/home-sections/Team.js");
const Sponsors = require("./views/home-sections/Sponsors.js");
const Documents = require("./views/home-sections/Documents.js");
const Contact = require("./views/home-sections/Contact.js");

// UTILS
const { isTouchDevice } = require("./utils/touchable.js");

const homeSections = [
  {
    id: "cover",
    view: Cover,
  },
  {
    id: "manifest",
    view: Manifest,
  },
  {
    id: "project",
    view: Project,
  },
  {
    id: "gallery",
    view: Gallery,
  },
  {
    id: "team",
    view: Team,
  },
  {
    id: "sponsors",
    view: Sponsors,
  },
  {
    id: "documents",
    view: Documents,
  },
  {
    id: "contact",
    view: Contact,
  }
];

function startLng(app) {
  return new Promise(function (done, err) {
    fetch(_env.apiURL + "lng.json").then(function (res) {
      res.json().then(function (dictionaries) {
        app.lng = new Lng(dictionaries);
        done(app);
      });
    });
  });
}

function startComponents(app) {
  return new Promise(function (done, err) {
    const parsers = new Array();
    Promise.all([
      fetch(_env.publicURL + "templates/components/header.html").then(function (
        res
      ) {
        parsers.push(
          res.text().then(function (template) {
            const el = document.querySelector("header");
            app.header = new Header(el, template, {
              app: app,
            });
          })
        );
      }),
      fetch(_env.publicURL + "templates/components/footer.html").then(function (
        res
      ) {
        parsers.push(
          res.text().then(function (template) {
            const el = document.querySelector("footer");
            app.footer = new Footer(el, template, {
              app: app,
            });
          })
        );
      }),
    ]).then(function () {
      Promise.all(parsers).then(function () {
        done(app);
      });
    });
  });
}

function startApp(app) {
  return new Promise(function (done, error) {
    app.router = new AppRouter(app).on(function () {
      app.router.navigate(
        app.router.generate("home-section", {
          section: "cover",
        })
      );
    });
    app.router.hooks({
      before: function (done, params) {
        app.router.ev.dispatch("before:navigate");
        done();
      },
      after: function () {
        app.router.ev.dispatch("navigate");
      },
    });

    function firstNavigation() {
      app.router.ev.off("navigate", firstNavigation);
      app.router.ev.on("navigate", onNavigate);
      app.header.onNavigate();
      done(app);
    }

    function onNavigate() {
      !(app.router.silent || app.scroll.scrolling) && app.header.onNavigate();
    }

    app.router.ev.on("navigate", firstNavigation);
    app.router.resolve();
  });
}

function scrollPatch(app) {
  app.scroll = new ScrollHandler(app, isTouchDevice());
  return app;
}

module.exports = function App() {
  const app = new Object();
  app.el = document.getElementById("app");
  if (isTouchDevice()) app.el.classList.add("is-touch");
  app.homeSections = homeSections;
  new Promise(function (done, err) {
    done(app);
  })
    .then(startLng)
    .then(scrollPatch)
    .then(startComponents)
    .then(startApp);
};
