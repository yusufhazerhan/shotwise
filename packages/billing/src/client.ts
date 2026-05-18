import { Environment, Paddle } from "@paddle/paddle-node-sdk";

let _client: Paddle | undefined;

export function getPaddle() {
  if (_client) return _client;
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) throw new Error("[@shotwise/billing] PADDLE_API_KEY is not set");
  const env = (process.env.PADDLE_ENV ?? "sandbox") === "production"
    ? Environment.production
    : Environment.sandbox;
  _client = new Paddle(apiKey, { environment: env });
  return _client;
}
