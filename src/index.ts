import 'reflect-metadata';
import application, { PORT } from './app';
import * as http from 'http';

const server = http.createServer(application.instance);

server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});