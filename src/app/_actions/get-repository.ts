'use server';
import { repositoryParamSchema, repositoriesSchema } from '@/schema/openapi/schema';
import { z } from '@hono/zod-openapi';

type Repository = z.infer<typeof repositoriesSchema>;
type RepositoryParam = z.infer<typeof repositoryParamSchema>;

export async function getRepository({ username }: RepositoryParam): Promise<Repository[]> {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        if (!response.ok) {
            throw new Error(`Failed to fetch repositories: ${response.statusText}`);
        }

        const json = await response.json();
        const result = repositoriesSchema.array().safeParse(json);

        if (!result.success) {
            console.error('Validation error:', result.error);
            throw new Error('Invalid response format');
        }

        return result.data;
    } catch (error) {
        console.error('Error fetching repositories:', error);
        throw error;
    }
}

