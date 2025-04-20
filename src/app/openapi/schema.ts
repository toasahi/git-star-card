import { z } from '@hono/zod-openapi';

// Schema for repository parameters
export const repositoryParamSchema = z.object({
  username: z
    .string()
    .openapi({
      param: {
        name: 'username',
        in: 'path',
      },
      example: 'toasahi',
    }),
});

// Schema for a single repository
const repositorySchema = z
  .object({
    id: z.number().openapi({ example: 896335270 }),
    node_id: z.string().openapi({ example: 'R_kgDONWz9pg' }),
    name: z.string().openapi({ example: 'awesome-mcp-servers' }),
    full_name: z.string().openapi({ example: 'punkpeye/awesome-mcp-servers' }),
    private: z.boolean().openapi({ example: false }),
    owner: z
      .object({
        login: z.string().openapi({ example: 'punkpeye' }),
        id: z.number().openapi({ example: 12345678 }),
        node_id: z.string().openapi({ example: 'MDQ6VXNlcjEyMzQ1Njc4' }),
        avatar_url: z.string().url().openapi({ example: 'https://avatars.githubusercontent.com/u/12345678?v=4' }),
        gravatar_id: z.string().nullable().openapi({ example: null }),
        url: z.string().url().openapi({ example: 'https://api.github.com/users/punkpeye' }),
        html_url: z.string().url().openapi({ example: 'https://github.com/punkpeye' }),
        followers_url: z.string().url().openapi({ example: 'https://api.github.com/users/punkpeye/followers' }),
        following_url: z.string().url().openapi({ example: 'https://api.github.com/users/punkpeye/following{/other_user}' }),
        gists_url: z.string().url().openapi({ example: 'https://api.github.com/users/punkpeye/gists{/gist_id}' }),
        starred_url: z.string().url().openapi({ example: 'https://api.github.com/users/punkpeye/starred{/owner}{/repo}' }),
        subscriptions_url: z.string().url().openapi({ example: 'https://api.github.com/users/punkpeye/subscriptions' }),
        organizations_url: z.string().url().openapi({ example: 'https://api.github.com/users/punkpeye/orgs' }),
        repos_url: z.string().url().openapi({ example: 'https://api.github.com/users/punkpeye/repos' }),
        events_url: z.string().url().openapi({ example: 'https://api.github.com/users/punkpeye/events{/privacy}' }),
        received_events_url: z.string().url().openapi({ example: 'https://api.github.com/users/punkpeye/received_events' }),
        type: z.string().openapi({ example: 'User' }),
        site_admin: z.boolean().openapi({ example: false }),
      })
      .openapi('Owner'),
    html_url: z.string().url().openapi({ example: 'https://github.com/punkpeye/awesome-mcp-servers' }),
    description: z.string().nullable().openapi({ example: 'A collection of MCP servers.' }),
    fork: z.boolean().openapi({ example: false }),
    created_at: z.string().openapi({ example: '2024-11-30T04:49:10Z' }),
    updated_at: z.string().openapi({ example: '2025-04-19T05:40:35Z' }),
    pushed_at: z.string().openapi({ example: '2025-04-17T08:54:16Z' }),
    stargazers_count: z.number().openapi({ example: 39791 }),
    watchers_count: z.number().openapi({ example: 39791 }),
    language: z.string().nullable().openapi({ example: null }),
    forks_count: z.number().openapi({ example: 2838 }),
    open_issues_count: z.number().openapi({ example: 82 }),
    default_branch: z.string().openapi({ example: 'main' }),
  })
  .openapi('Repository');

export const commitActivitySchema = z.object({
  days: z.array(z.number()).openapi({ example: [0, 0, 0] }),
  total: z.number().openapi({ example: 10 }),
  week: z.number().openapi({ example: 1672444800 }),
}).openapi('Activity');

export const commitActivitiesSchema = z.array(commitActivitySchema).openapi('Activities');

export const repositoriesSchema = z
  .array(repositorySchema)
  .openapi('Repositories');

export const githubStatsSchema = z
  .array(
    z.object({
      repository: repositorySchema,
      commit_activity: commitActivitySchema,
    })
  )
  .openapi('GitHubStats');