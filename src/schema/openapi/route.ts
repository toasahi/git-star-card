import { createRoute } from '@hono/zod-openapi';
import { repositoryParamSchema, repositoriesSchema } from './schema';

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
                    schema: repositoriesSchema,
                },
            },
            description: 'Retrieve the repositories of a user',
        },
        400: {
            description: 'Bad Request - Invalid username parameter',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});