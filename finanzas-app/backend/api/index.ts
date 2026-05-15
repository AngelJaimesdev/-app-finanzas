import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

const expressApp = express();
let isReady = false;
let initError: Error | null = null;

async function bootstrap() {
  if (isReady) return;
  if (initError) throw initError;

  try {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error', 'warn', 'log'] },
    );
    app.enableCors({ origin: '*' });
    await app.init();
    isReady = true;
    console.log('NestJS app initialized successfully');
  } catch (err) {
    initError = err;
    console.error('Error initializing NestJS app:', err);
    throw err;
  }
}

module.exports = async (req: any, res: any) => {
  try {
    await bootstrap();
    expressApp(req, res);
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
};
