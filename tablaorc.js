// TABLAO CONFIGURATION FILE WITH INFORMATION
// ABOUT THE PROJECT

module.exports = {
  src: "src",
  public: "public",
  dist: "dist",
  port: 8050,
  middleware: function (connect, opt) {
    // Example middleware to disable cache on local environment.
    return [
      function (req, res, next) {
        res.setHeader(
          "Cache-Control",
          "private, no-cache, no-store, must-revalidate"
        );
        res.setHeader("Pragme", "no-cache");
        res.setHeader("Expires", "-1");
        next();
      },
    ];
  },
};
