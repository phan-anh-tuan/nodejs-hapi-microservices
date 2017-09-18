
const Path = require('path');
const stream = require('stream');
const fs = require('fs');
const internals = {}

internals.applyRoutes = function(server,next) {
    server.views({
        engines: {
            html: {
                module: require('handlebars')
            }
        },
        relativeTo: `${__dirname}/..`,
        path: 'views',
        layoutPath: 'views/layout',
        layout: 'default',
        helpersPath: 'views/helpers',
        partialsPath: 'views/partials'
    });

    // serve static contents from public folder
    server.route({
        method: 'GET',
        path: '/assets/{param*}', 
        handler: {
            directory: {
                path: Path.resolve(__dirname,'../public'),
                redirectToSlash: true,
                index: true
            }
        }
    });
    server.route({
                method: 'GET',
                path: '/signup',
                config: {
                    handler: function(request, reply) {
                        let context = { user: { role: 'user'},
                                        script: [{ url: '/assets/js/signup.js'}] };
                        reply.view('index',context);
                    },
                }
            });
                    
    server.route({
        method: 'GET',
        path: '/signin/{path*}',
        config: {
            handler: function(request, reply) {
                let context = { user: { role: 'user'},
                                script: [{ url: '/assets/js/login.js'}] };
                reply.view('index',context);
            },
        }
    });

    server.route({
        method: 'GET',
        path: '/report/{path*}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'account'
            },
            handler: function(request, reply) {
                let context = { user: { role: 'user'},
                                script: [{ url: '/assets/js/report.js'}] };
                reply.view('index',context);
            },
        }
    });


    server.route({
        method: 'GET',
        path: '/files/download/{from}/{to}/{filename}/{path*}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'account'
            },
            handler: function(request, reply) {
                /*
                class FileUploadStream extends stream.Readable {
                    constructor(from,to,name) {
                        super();
                        this.from = from;
                        this.to = to;
                        this.name = name
                    }
                    _read(size) {
                        const chunk = server.plugins['socket-io'].readData(this.from,this.to,this.name)
                        console.log(`web.js read data chunk from ${this.from}:${this.to}:${this.name}, total bytes: ${chunk.data.length}, end: ${chunk.end}`)
                        if (chunk.data.length > 0) {
                            this.push(chunk.data);
                        }
                        if(chunk.end) {
                            this.push(null);
                        }

                        this.pause();
                        console.log('web.js There will be no additional data for 1 second.');
                        setTimeout(() => {
                          console.log('web.js Now data will start flowing again.');
                          this.resume();
                        }, 5000)
                    }
                }
                */
                //const rs = new FileUploadStream(request.params.from,request.params.to,request.params.filename);
                const rs = fs.createReadStream(Path.resolve(`${__dirname}/../tmp/${request.params.from}/${request.params.to}/${request.params.filename}`))
                reply(rs)
            },
        }
    });
    
    

    server.route({
        method: 'GET',
        path: '/chat/{path*}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'account'
            },
            handler: function(request, reply) {
                let context = { user: { role: 'user',
                                        token: request.auth.credentials.user._id,
                                        name: request.auth.credentials.user.username,
                                },
                                script: [
                                    { url: '/assets/js/chat.js'},
                                    { url: '/assets/static/kurento-utils.js'},
                                    { url: '/assets/static/adapter.js'},
                                    { url: '/assets/static/videocall.js'},
                                    { url: '/socket.io/socket.io.js'}]
                            };
                reply.view('index',context);
            },
        }
    });

    server.route({
        method: 'GET',
        path: '/contact/{path*}',
        config: {
            handler: function(request, reply) {
                let context = { user: { role: 'user'},
                                script: [{url: '/assets/js/contact.js'}] };
                reply.view('index',context);
            },
        }
    });
/*
    server.route({
        method: 'GET',
        path: '/resource/request',
        config: {
            auth: {
                strategy: 'session',
                scope: 'account'
            },
            handler: function(request, reply) {
                let context = { user: { role: 'user'},
                                script: [{ url: '/assets/js/bundle.js'}] };
                reply.view('index', context);
            }
        }
    });
*/
    server.route({
        method: 'GET',
        path: '/{path*}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'account'
            },
            handler: function(request, reply) {
                let context = { user: { role: 'user',
                                        token: request.auth.credentials.user._id,
                                        name: request.auth.credentials.user.username},
                                script: [{ url: '/assets/js/bundle.js'}],
                                isAuthenticated: true };
                reply.view('index', context);
            }
        }
    });
    next();
                    
}

exports.register = function(server,options,next) {
    server.dependency('auth', internals.applyRoutes);
    next();
}

exports.register.attributes = {
    name: 'web'
}