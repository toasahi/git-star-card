import { hc } from 'hono/client';
import type { AppType } from '@/app/api/[[...route]]/route';

// Create a typed client for the Hono API
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
export const client = hc<AppType>(API_BASE_URL); // AppTypeを使用
