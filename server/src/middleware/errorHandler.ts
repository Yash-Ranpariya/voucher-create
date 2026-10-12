import { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  statusCode: number;
  fields?: any;
  constructor(message: string, statusCode: number = 500, fields?: any) {
    super(message);
    this.statusCode = statusCode;
    this.fields = fields;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  if (err.name === 'MulterError' || (err.message && err.message.includes('Invalid file type'))) {
    statusCode = 400;
  }
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message,
      ...(err.fields && { fields: err.fields })
    }
  });
};
