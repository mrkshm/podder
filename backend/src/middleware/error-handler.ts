import { Request, Response, NextFunction } from 'express';
import AppError from '@/errors/app-error';

export default function errorHandler(
  err: AppError,
  _: Request,
  res: Response,
  __: NextFunction
) {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).send({
      status: 'error',
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else if (process.env.NODE_ENV === 'production') {
    if (err.isOperational) {
      res.status(err.statusCode).send({
        status: 'error',
        message: err.message
      });
    } else {
      console.error('ERROR 💥:', err);
      res.status(500).send({
        status: 'error',
        message: 'Internal Server Error'
      });
    }
  }
}

