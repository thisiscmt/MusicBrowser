import http from 'http';

import app from './app.js';

function onError(error: NodeJS.ErrnoException) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

const port = process.env.PORT || 3060;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
server.on('error', onError);

console.log(`Music Browser API has started on port ${port}`);
