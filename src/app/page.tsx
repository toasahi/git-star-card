import { client } from "@/lib/hono";
import { z } from "@hono/zod-openapi";
import { githubStatsSchema } from "@/app/openapi/schema";

// 型をスキーマから推論
type ResponseType = z.infer<typeof githubStatsSchema>;

export default async function Home() {
  const response = await client.api.github.repos[":username"].$get({
    param: { username: "toasahi" }
  });

  // レスポンスをJSON形式に変換
  const repositories = await response.json() as ResponseType;


  console.log(repositories);

  return (
    <main className="">
      {/* データを表示する場合 */}
      {/* {repositories.map((repo) => (
        <div key={repo.repository.id}>{repo.repository.name}</div>
      ))} */}
    </main>
  );
}
