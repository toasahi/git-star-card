import { client } from "@/lib/hono";
import { z } from "@hono/zod-openapi";
import { githubStatsSchema } from "@/app/openapi/schema";
import { GitHubRepoCard } from "@/components/github-repo-card";

// 型をスキーマから推論
type ResponseType = z.infer<typeof githubStatsSchema>;

export default async function Home() {
  const response = await client.api.github.repos[":username"].$get({
    param: { username: process.env.USERNAME ?? "" }
  });

  // レスポンスをJSON形式に変換
  const repositories = await response.json() as ResponseType;

  return (
    <main className="">
      <h1 className="text-2xl font-bold text-center mt-4">GitHub <span>⭐️</span> Repositories</h1>
      <section className="grid grid-cols-3 gap-4 p-4">
      {repositories.map((repo) => (
        <GitHubRepoCard githubStat={repo} key={repo.repository.id} /> 
      ))}
      </section>
    </main>
  );
}
