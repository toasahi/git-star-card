import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { Hono } from 'hono';
import { OpenAPIHono } from '@hono/zod-openapi';
import { route } from '@/app/openapi/public-route';
import { swaggerUI } from "@hono/swagger-ui";
import { repositoriesSchema, commitActivitySchema, githubStatsSchema, commitActivitiesSchema } from '@/app/openapi/schema';

export const runtime = 'edge';

const baseApp = new Hono(); // Honoインスタンスを作成
baseApp.use('*', logger()); // loggerミドルウェアを適用

const app = new OpenAPIHono(baseApp) // OpenAPIHonoで拡張
  .basePath('/api')
  .openapi(route, async (c) => {
    try {
      const { username } = c.req.param();
      if (!username) {
        return c.json({ error: 'Username is required' }, 400);
      }

      const repositoryStarredResponse = await fetch(`https://api.github.com/users/${username}/starred`,{
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          
        },
      });
      if (!repositoryStarredResponse.ok) {
        if (repositoryStarredResponse.status > 400 && repositoryStarredResponse.status < 500) {
          return c.json({ error: `Bad Request: ${repositoryStarredResponse.statusText}` }, 400);
        } else if (repositoryStarredResponse.status >= 500) {
          return c.json({ error: `Server Error: ${repositoryStarredResponse.statusText}` }, 500);
        } else {
          return c.json({ error: `Unexpected Error: ${repositoryStarredResponse.statusText}` });
        }
      }
      const json = await repositoryStarredResponse.json();
      const repos = repositoriesSchema.safeParse(json);

      if (!repos.success) {
        return c.json({ error: 'Invalid repository data' });
      }

      const statsPromises = repos.data.map(async (repo) => {
        const commitActivityResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/stats/commit_activity`,{
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              
            },
          }
        );

        if (!commitActivityResponse.ok) {
          return null;
        }

        const commitActivityJson = await commitActivityResponse.json();
        console.log(`${repo.full_name} of commitActivity`, commitActivityJson);
        const commitActivity = commitActivitiesSchema.safeParse(commitActivityJson);


        if (!commitActivity.success) {
          return null;
        }

        return {
          repository: repo,
          commit_activity: commitActivity.data,
        };
      });

      const stats = (await Promise.all(statsPromises)).filter((stat) => stat !== null);

      const githubStats = githubStatsSchema.safeParse(stats);

      if (!githubStats.success) {
        return c.json({ error: 'Invalid GitHub stats data' });
      }

      return c.json(githubStats.data);
    } catch (error) {
      console.error('Error in API handler:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  })
  .doc("/specification", {
    openapi: "3.0.0",
    info: { title: "Honote API", version: "1.0.0" },
  })
  .get("/doc", swaggerUI({ url: "/api/specification" }));

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export type AppType = typeof app;
