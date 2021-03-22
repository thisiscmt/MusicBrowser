import express from 'express';
import debug from 'debug';

import router from "./routes";

debug('music-browser');

const app = express();
const port = process.env.MB_PORT || 3030;

app.on('error', (error: any) => {
    // TODO: Log this somewhere
    console.log('An error occurred: %o', error.message);
});

app.set('port', port);
app.use(router)
app.listen(port);

console.log(`Listening on port ${port}`)
