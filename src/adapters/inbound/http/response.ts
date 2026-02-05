import type { Response } from 'express';
import type { OrderResponseDto } from '../../../domain/order/dto/order-response.dto';

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  status: number;
  details?: Array<{ field: string; message: string }>;
}

export interface ApiSuccessResponse {
  success: true;
  message: string;
  status: number;
  data: any;
}

export type ApiOrderResponse = ApiErrorResponse | ApiSuccessResponse;

export function sendSuccess(
  res: Response,
  status: number,
  message: string,
  data: any
): void {
  const body: ApiSuccessResponse = {
    success: true,
    message,
    status,
    data,
  };
  res.status(status).json(body);
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  code: string,
  details?: Array<{ field: string; message: string }>
): void {
  const body: ApiErrorResponse = {
    success: false,
    message,
    code,
    status,
    ...(details && details.length > 0 ? { details } : {}),
  };
  res.status(status).json(body);
}
