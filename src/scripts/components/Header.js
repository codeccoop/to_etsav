const Header = (function () {

    const _Header = function (el) {
        this.el = el;
    }

    _Header.prototype.onRender = function onRender () {
        Array.apply(null, this.el.getElementsByClassName("header__link")).forEach(link => {
            link.addEventListener("click", function () {
                console.log(this);
            });
        });
        console.log("Header rendered");
    }

    return _Header;
})();

module.exports = Header;