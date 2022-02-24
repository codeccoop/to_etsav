// OBJECT WITH GLOBAL VISIBILITY ON THE CLIENT WITH
// INFORMATION ABOUT HOW TO REACH THE SERVER

module.exports = {
  dev: {
    name: "development",
    host: "127.0.0.1",
    port: 8050,
    apiURL: "/public/data/",
    publicURL: "/public/",
  },
  pre: {
    name: "preproduction",
    host: "http://dadescomunals.tk/to",
    apiURL: "/to/public/data/",
    publicURL: "/to/public/",
  },
  pro: {
    name: "production",
    host: "https://www.to.upc.edu/",
    port: null,
    apiURL: "https://www.to.upc.edu/public/data/",
    publicURL: "https://www.to.upc.edu/public/",
  },
};
