// CORE
const BaseView = require("../core/BaseView.js");
const ScrollHandler = require("../helpers/ScrollHandler.js");

const Home = (function() {

    const Home = BaseView.extend(function(el, template, sections) {
        const self = this;
        this.fetchChilds(sections).then(function() {
            self.data.sections = sections;
        });
    });

    Home.prototype.onUpdate = function onUpdate() {
        this.render();
    };

    Home.prototype.onRender = function onRender() {
        for (let section of this.data.sections) {
            section.view = new section.view(this.el.querySelector(`#${section.id}`), section.template);
        }
        this.scrollHandler = new ScrollHandler(this.el, this.el.getElementsByClassName("scroll-section"));
        this.scrollHandler.patch();
    };

    Home.prototype.fetchChilds = function fetchChilds(sections) {
        const self = this;
        return Promise.all(sections.map(function(section) {
            return new Promise(function(done, error) {
                fetch(_env.publicURL + `templates/home-sections/${section.id}.html`)
                    .then(function(res) {
                        res.text().then(function(template) {
                            section.template = template;
                            done(section);
                        });
                    });
            });
        }));
    };

    return Home;
})();

module.exports = Home;
