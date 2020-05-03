const Documents = (function () {
    const _Documents = function (el) {
        this.el = el;
    }

    _Documents.prototype.onRender = function onRender () {
        console.log("Documents rendered");
    }

    return _Documents;
})();

module.exports = Documents;