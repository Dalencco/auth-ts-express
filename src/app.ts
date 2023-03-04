import express, { Application as ExApplication, Handler, Request, Response } from 'express';
import { controllers } from '@/controllers';
import { MetadataKeys } from '@/utils/metadata.keys';
import { IRouter } from '@/utils/decorators/handlers.decorator';

import cors from "cors";
import morgan from "morgan";
import cookieParser from 'cookie-parser';

export const PORT = process.env.PORT || 3001;

class Application {
    private readonly _app: ExApplication;

    get instance(): ExApplication {
        return this._app;
    }

    constructor() {
        this._app = express();
        this._app.use(express.json());
        this._app.use(cors<Request>());
        this._app.use(morgan('common'));
        this._app.use(cookieParser())
        this.registerRouters();
    }

    private registerRouters() {
        controllers.forEach((controllerClass) => {
            const controllerInstance: { [handleName: string]: Handler } = new controllerClass() as any;

            const basePath: string = Reflect.getMetadata(MetadataKeys.BASE_PATH, controllerClass);
            const routers: IRouter[] = Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass);

            const exRouter = express.Router();

            routers.forEach(({ method, path, handlerName}) => {
                exRouter[method](path, controllerInstance[String(handlerName)].bind(controllerInstance));
            });

            this._app.use(basePath, exRouter);
        });

    }
  }
  export default new Application();