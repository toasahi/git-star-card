import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { OpenAPIHono } from '@hono/zod-openapi';
import { route } from '@/schema/openapi/route';
import { swaggerUI } from "@hono/swagger-ui";

export const runtime = 'edge';

const app = new OpenAPIHono().basePath('/api');

app.openapi(route, async (c) => {
  try {
    const { username } = c.req.param();
    if (!username) {
      return c.json({ error: 'Username is required' }, 400);
    }

    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    if (!response.ok) {
      if(response.status > 400 && response.status < 500){
        return c.json({ error: `Bad Request: ${response.statusText}` }, 400);
      }else if(response.status >= 500){
        return c.json({ error: `Server Error: ${response.statusText}` }, 500);
      }else{
        return c.json({ error: `Unexpected Error: ${response.statusText}` });
      }
    }
    const repos = await response.json();
    return c.json(repos);
  } catch (error) {
    console.error('Error in API handler:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
}).use(logger());

app.doc("/specification", {
  openapi: "3.0.0",
  info: { title: "Honote API", version: "1.0.0" },
}).get("/doc", swaggerUI({ url: "/api/specification" }));

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export type AppType = typeof app;
