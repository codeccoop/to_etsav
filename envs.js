// OBJECT WITH GLOBAL VISIBILITY ON THE CLIENT WITH
// INFORMATION ABOUT HOW TO REACH THE SERVER

module.exports = {
    dev: {
        name: 'development',
        host: '127.0.0.1',
        port: 8050,
        apiURL: '/public/data/',
        publicURL: '/public/'
    },
    pre: {
        name: 'preproduction',
        host: 'http://pre.domain.com/path',
        port: null,
        apiURL: 'http://pre.domain.com/path/rest/',
        publicURL: 'http://pre.domain.com/path/public/'
    },
    pro: {
        name: 'production',
        host: "http://domain.com/path",
        port: null,
        apiURL: 'http://domain.com/path/rest/',
        publicURL: 'http://domain.com/path/app/public/'
    }
}
