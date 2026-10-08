// Test-only resolve hook. The game modules use extensionless relative imports
// (`./logic`), which Vite resolves but Node's --experimental-strip-types does
// not. Register this with `--import ./scripts/ts-resolve-hook.mjs` so
// `node --test src/game/*.test.ts` can load them unchanged.
import { register } from "node:module";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    const relative = specifier.startsWith("./") || specifier.startsWith("../");
    const bare = !/\\.[cm]?[jt]sx?$/.test(specifier);
    if (err?.code === "ERR_MODULE_NOT_FOUND" && relative && bare) {
      return next(specifier + ".ts", context);
    }
    throw err;
  }
}
`),
);
