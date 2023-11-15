import express from 'express';
import cors from 'cors';
import helmet from "helmet";

import baseRouter from './routes/baseRouter.js';
import metadataRouter from './routes/metadataRouter.js';
import errorRouter from './routes/errorRouter.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: function(origin, callback){
        if (process.env.NODE_ENV === 'production') {
            return callback(null, process.env.DIHT_ALLOWED_ORIGIN)
        } else {
            return callback(null, true);
        }
    },
    credentials: true
}));

app.use(helmet({
    crossOriginResourcePolicy: {
        policy: 'cross-origin'
    }
}));

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use('/', baseRouter);
app.use('/metadata', metadataRouter);
app.use('/error', errorRouter);

export default app;
