const App = require('./scripts/App.js');

if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", App, false);
} else if (document.attachEvent) {
    document.attachEvent("onreadystatechange", App);
} else {
    window.onload = App;
}
