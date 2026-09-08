import app, { initStore } from "../server.ts";

let ready: Promise<void>;

// Ensure the store (Supabase-backed) is initialized before handling any request.
// Re-check on cold starts; on warm instances this resolves immediately.
export default async function handler(req: any, res: any) {
  if (!ready) {
    ready = initStore().then(
      () => undefined,
      (err) => {
        console.error("initStore failed:", err);
      }
    );
  }
  await ready;
  return app(req, res);
}