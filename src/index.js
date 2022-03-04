const App = require('./scripts/App.js');
const { setViewport } = require('./scripts/utils/viewport.js');

if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", App, false);
} else if (document.attachEvent) {
    document.attachEvent("onreadystatechange", App);
} else {
    window.onload = App;
}

setViewport();
