import morgan from 'morgan';
import { Request, Response } from 'express';

// Morgan custom token or format
export const requestLogger = morgan((tokens, req: Request, res: Response) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens['response-time'](req, res);

  return `[HTTP] ${method} ${url} ${status} - ${responseTime} ms`;
}, {
  skip: () => process.env.NODE_ENV === 'test',
});
