function setViewport() {
  var vh = window.innerHeight * 0.01;
  var vw = window.innerWidth * 0.01;

  document.documentElement.style.setProperty("--vh", `${vh}px`);
  document.documentElement.style.setProperty("--vw", `${vw}px`);
}

window.addEventListener("resize", setViewport);

module.exports = {
	setViewport: setViewport
};
