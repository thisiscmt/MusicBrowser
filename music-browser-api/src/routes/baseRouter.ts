import express from  'express';

const baseRouter = express.Router();

baseRouter.get('/', function(request, response) {
  response.status(200).send('Music Browser API');
});

export default baseRouter;
