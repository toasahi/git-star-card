import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { Context, Hono } from 'hono';
import { OpenAPIHono } from '@hono/zod-openapi';
import { route } from '@/app/openapi/public-route';
import { swaggerUI } from '@hono/swagger-ui';
import { repositoriesSchema, githubStatsSchema, commitActivitiesSchema } from '@/app/openapi/schema';

export const runtime = 'edge';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_API_HEADERS = {
  Accept: 'application/vnd.github.v3+json',
};

// Fetch with retry logic
const fetchWithRetry = async (url: string, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, { headers: GITHUB_API_HEADERS });
    if (response.ok) {
      const data = await response.json();
      if (Object.keys(data).length > 0) return data;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retrying
  }
  return null; // Return null if all retries fail
};

// Handle API errors
const handleApiError = (response: Response, c: Context) => {
  if (response.status >= 400 && response.status < 500) {
    return c.json({ error: `Bad Request: ${response.statusText}` }, 400);
  } else if (response.status >= 500) {
    return c.json({ error: `Server Error: ${response.statusText}` }, 500);
  }
  return c.json({ error: `Unexpected Error: ${response.statusText}` });
};

// Fetch starred repositories
const fetchStarredRepositories = async (username: string) => {
  const url = `${GITHUB_API_BASE_URL}/users/${username}/starred`;
  const response = await fetch(url, { headers: GITHUB_API_HEADERS });
  if (!response.ok) return { error: response };
  const json = await response.json();
  return repositoriesSchema.safeParse(json);
};

// Fetch commit activity for a repository
const fetchCommitActivity = async (repoFullName: string) => {
  const url = `${GITHUB_API_BASE_URL}/repos/${repoFullName}/stats/commit_activity`;
  const data = await fetchWithRetry(url);
  if (!data) return null;
  return commitActivitiesSchema.safeParse(data);
};

const baseApp = new Hono();
baseApp.use('*', logger());

const app = new OpenAPIHono(baseApp)
  .basePath('/api')
  .openapi(route, async (c) => {
    try {
      const { username } = c.req.param();
      if (!username) {
        return c.json({ error: 'Username is required' }, 400);
      }

      const reposResult = await fetchStarredRepositories(username);
      if ('error' in reposResult) {
        if (reposResult.error instanceof Response) {
          return handleApiError(reposResult.error, c);
        }
        return c.json({ error: 'Unexpected error occurred' }, 500);
      }
      if (!reposResult.success) {
        return c.json({ error: 'Invalid repository data' });
      }

      const statsPromises = reposResult.data.map(async (repo) => {
        const commitActivityResult = await fetchCommitActivity(repo.full_name);
        if (!commitActivityResult || !commitActivityResult.success) {
          console.warn(`Commit activity is empty or invalid for repository: ${repo.full_name}`);
          return null;
        }
        return {
          repository: repo,
          commit_activity: commitActivityResult.data,
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
  .doc('/specification', {
    openapi: '3.0.0',
    info: { title: 'Honote API', version: '1.0.0' },
  })
  .get('/doc', swaggerUI({ url: '/api/specification' }));

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export type AppType = typeof app;
