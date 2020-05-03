const Header = (function () {

    const Header = function Header (el) {
        Array.apply(null, el.getElementsByClassName("header__link")).forEach(link => {
            link.addEventListener("click", function () {
                console.log(this)
            });
        })
    }

    return Header;
})();

module.exports = Header;