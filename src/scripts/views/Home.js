const BaseView = require("../core/BaseView.js");


const Home = (function () {
    const Home = BaseView.extend(function (el, template) {
      const self = this;
      this.load(_env.apiURL + "home.json").then(function (response) {
        const data = JSON.parse(response);
        data.sections.forEach(function (sect) {
          sect.image = _env.publicURL + "images/" + sect.image;
        });
        self.data = data;
      });
    });

    Home.prototype.onUpdate = function onUpdate () {
      // console.log("Home updated");
      this.render();
    };

    Home.prototype.onRender = function onRender () {
        console.log("Home rendered");
    };

    Home.prototype.onRemove = function onRemove () {
        console.log("Home removed");
    };

    return Home;
})();

module.exports = Home;
