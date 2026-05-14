import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from '../src/app.module';

const expressApp = express();
let isReady = false;

async function bootstrap() {
  if (isReady) return;
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn'] },
  );
  app.enableCors({ origin: '*' });
  await app.init();
  isReady = true;
}

module.exports = async (req: any, res: any) => {
  await bootstrap();
  expressApp(req, res);
};
