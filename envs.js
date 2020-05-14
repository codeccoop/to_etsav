module.exports = {
    dev: {
        name: 'development',
        host: 'localhost',
        port: 8050,
        apiURL: '/statics/data/',
        staticURL: '/statics/'
    },
    pre: {
        name: 'preproduction',
        host: 'http://pre.domain.com/path',
        apiURL: 'http://pre.domain.com/path/rest/',
        staticURL: 'http://pre.domain.com/path/statics/'
    },
    pro: {
        name: 'production',
        host: "http://domain.com/path",
        apiURL: 'http://domain.com/path/rest/',
        staticURL: 'http://domain.com/path/app/statics/'
    }
}