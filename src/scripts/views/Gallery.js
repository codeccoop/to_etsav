const BaseView = require("../core/BaseView.js");

const Gallery = (function () {
  /// PRIVATE BLOCK CODE
  var renderCount = 0;
  /// END OF PRIVATE BLOCK CODE

  var Gallery = function (el, template) {
    const self = this;
    this.load(_env.apiURL + "gallery_images.json").then(function (images) {
      self.load(_env.apiURL + "gallery_videos.json").then(function (videos) {
        var data = {
          images: JSON.parse(images).files,
          videos: JSON.parse(videos).files,
        };

        data.rows = [];
        var rowindex = -1;
        var index = 0;
        for (let img of data.images) {
          if (index % 3 == 0) {
            data.rows.push({ items: [] });
            rowindex++;
          }
          img.id = "imatge" + index;
          img.index = index;
          img.file = encodeURIComponent(img.file);
          img.smallfile =
            img.file.split(".")[0] + "--small." + img.file.split(".")[1];
          img.type = "image";
          data.rows[rowindex].items.push(img);
          index++;
        }
        for (let vdo of data.videos) {
          if (index % 3 === 0) {
            data.rows.push({ items: [] });
            rowindex++;
          }
          vdo.id = "video" + index;
          vdo.index = index;
          vdo.file = encodeURIComponent(vdo.file);
          vdo.type = "video";
          data.rows[rowindex].items.push(vdo);
          index++;
        }
        self.data = data;
        console.log(data);
      });
    });
    this.onClickImage = this.onClickImage.bind(this);
    this.onCloseOverlay = this.onCloseOverlay.bind(this);
  };

  Gallery = BaseView.extend(Gallery);

  Gallery.prototype.onUpdate = function onUpdate() {
    this.render();
  };

  Gallery.prototype.onRender = function onRender() {
    const self = this;
    for (let img of self.el.querySelectorAll(".img-container img")) {
      img.addEventListener("click", self.onClickImage);
    }
    this.app.header.addClass("green", true);
    this.app.header.addClass("breadcrumb", true);
    this.app.header.setSections([{ id: "gallery" }]);
  };

  Gallery.prototype.beforeRemove = function onRemove() {
    const self = this;
    for (let img of self.el.querySelectorAll(".img-row")) {
      img.removeEventListener("click", self.onClickImage);
    }
  };

<<<<<<< HEAD
    Gallery.prototype.onClickImage = function () {
        var overlay = document.querySelector('.overlay');
        overlay.classList.add('activo');
        document.body.style.overflowY = "hidden";
        this.carousel = $(".carousel").slick({
            adaptiveHeight: true,
            mobileFirst: true,
            dots: true,
            appendDots: ".overlay .dots"
        });
        var boton = document.querySelector('#boton-cerrar');
        boton.removeEventListener('click', this.onCloseOverlay);
        boton.addEventListener('click', this.onCloseOverlay);
        overlay.removeEventListener('click', this.onCloseOverlay);
        overlay.addEventListener('click', this.onCloseOverlay);
    };
=======
  Gallery.prototype.onClickImage = function (event) {
    var smallimage = event.target;
    var index = smallimage.getAttribute("index");
    var overlay = document.querySelector(".overlay");
    overlay.classList.add("activo");
    document.body.style.overflowY = "hidden";
    this.carousel = $(".carousel").slick({
      // adaptiveHeight: true,
      mobileFirst: true,
      // dots: true,
      // appendDots: ".overlay .dots",
      // initialSlide: index
    });
    $(".carousel").slick("slickGoTo", index, true);
    var boton = document.querySelector("#boton-cerrar");
    boton.removeEventListener("click", this.onCloseOverlay);
    boton.addEventListener("click", this.onCloseOverlay);
    overlay.removeEventListener("click", this.onCloseOverlay);
    overlay.addEventListener("click", this.onCloseOverlay);
  };
>>>>>>> 030e5f5... Videos & projecte

  Gallery.prototype.onCloseOverlay = function onCloseOverlay(ev) {
    var overlay = document.querySelector(".overlay");
    var boton = document.querySelector("#boton-cerrar");
    if (overlay === ev.target || ev.target.id == "boton-cerrar") {
      overlay.classList.remove("activo");
      document.body.style.overflowY = null;
      boton.removeEventListener("click", this.onCloseOverlay);
      overlay.removeEventListener("click", this.onCloseOverlay);
      $(".carousel").slick("unslick");
      this.carousel = null;
    }
  };

  return Gallery;
})();

module.exports = Gallery;
