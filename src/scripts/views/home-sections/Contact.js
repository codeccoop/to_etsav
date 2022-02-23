const BaseView = require("../../core/BaseView.js");


const Contact = (function() {
    const Contact = BaseView.extend(function Contact (el, template, data) {
        const self = this;
        this.data={imageURL: _env.publicURL+"images/imatge_to.jpg"}
        this.render();
    });

    return Contact;
})();

module.exports = Contact;
