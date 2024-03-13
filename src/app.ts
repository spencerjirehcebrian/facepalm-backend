import express, { Express } from 'express';

import { FacePalmServer } from './setupServer';
import databaseConnection from './setupDatabase';

import { config } from './config';

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
  }
}

const application: Application = new Application();
application.initialize();
