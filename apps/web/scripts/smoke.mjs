const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3003";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectStatus(path, status) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  if (response.status !== status) {
    throw new Error(`${path} expected ${status}, got ${response.status}`);
  }
  return response;
}

async function expectRedirect(path, target) {
  const response = await expectStatus(path, 307);
  const location = response.headers.get("location");
  assert(
    location === target || location === `${baseUrl}${target}`,
    `${path} redirected to ${location}, expected ${target}`,
  );
}

async function main() {
  await expectStatus("/", 200);
  await expectStatus("/pricing", 200);
  await expectStatus("/studio", 200);
  await expectRedirect("/sign-in", "/studio");
  await expectRedirect("/sign-up", "/studio");
  await expectRedirect("/editor/22222222-2222-4222-8222-222222222222", "/studio");
  await expectRedirect("/dashboard", "/studio");

  console.log(`local smoke ok for ${baseUrl}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
