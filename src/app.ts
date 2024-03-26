import express, { Express } from 'express';

import { FacePalmServer } from '@root/setupServer';
import databaseConnection from '@root/setupDatabase';

import { config } from '@root/config';

// import tester from '@feature/tester/'

class Application {
  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app: Express = express();
    const server: FacePalmServer = new FacePalmServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const application: Application = new Application();
application.initialize();
