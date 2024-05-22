import bodyParser from 'body-parser';
import express from 'express';

import { errorHandler } from './middlewares/error-handler';
import routes from './routes';
import path from 'path';

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes);

app.use(errorHandler);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

export default app;
