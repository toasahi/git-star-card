import { createRoute } from '@hono/zod-openapi';
import { repositoryParamSchema, githubStatsSchema } from './schema';

// Define the route for fetching user repositories
export const route = createRoute({
    method: 'get',
    path: '/github/repos/:username',
    request: {
        params: repositoryParamSchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: githubStatsSchema,
                },
            },
            description: 'Retrieve the GitHub statistics of a user',
        },
        400: {
            description: 'Bad Request - Invalid username parameter',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});