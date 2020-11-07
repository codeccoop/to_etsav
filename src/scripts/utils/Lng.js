const BaseView = require("../core/BaseView.js");


const Lng = (function () {
    // PRIVATE CODE BLOCK

    // PUBLIC CLASS
    const Lng = function (dictionaries) {
        const self = this;

        this.dictionaries = new Map();
        for (let lng in dictionaries) {
            this.dictionaries.set(lng, new Map(Object.entries(dictionaries[lng])));
        };

        Object.defineProperty(self, "dictionary", {
            get: function () {
                return self.dictionaries.get(self.currentLanguage);
            }
        });

        Object.defineProperty(this, "currentLanguage", {
            get: function () {
                return location.hash.match(/\?lng\=([a-z]{2})/)[1];
            },
            set: function (lng) {
                const currentLocation = location.hash.replace(/(?<=\?lng\=).*$/, '');
                location.hash = currentLocation + lng;
                location.reload();
            }
        });

        if (location.hash.match(/\?lng=[a-zA-Z]{2}/)) {
            if (Object.keys(dictionaries).indexOf(location.hash.match(/\?lng=([a-zA-Z]{2})/)[1]) == -1) {
                this.currentLanguage = "en";
            }
        } else {
            this.currentLanguage = "en";
        }
        BaseView.prototype.translate = this.parse.bind(this);
    };

    Lng.prototype.translate = function translate (key) {
        return this.dictionary.get(key) || "lng-" + key;
    };

    Lng.prototype.parse = function parse (template) {
        const keys = template.match(/\$lng\([^\)]*\)/g);
        if (!keys) return template;
        for (let key of keys) {
            template = template.replace(key, this.translate(key.substr(5).slice(0, -1)));
        };
        return template;
    };

    return Lng;
})();

module.exports = Lng;
