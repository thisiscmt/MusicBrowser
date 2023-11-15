import express from  'express';

const errorRouter = express.Router();

errorRouter.post('/', function(request, response) {
    try {
        if (request.body.errorData) {
            console.log('A browser error occurred: %o: ', request.body.errorData);
        }
    } catch (error) {
        // TODO
    }

    response.status(200).send();
});

export default errorRouter;
