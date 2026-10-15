import type { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data })
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  message: string,
  errors: any = null,
  statusCode = 400
): Response => {
  const payload: ApiResponse = {
    success: false,
    message,
    ...(errors !== null && { errors })
  };
  return res.status(statusCode).json(payload);
};
