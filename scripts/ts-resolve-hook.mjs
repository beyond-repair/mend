// Test-only resolve hook. The game modules use extensionless relative imports
// (`./logic`), which Vite resolves but Node's --experimental-strip-types does
// not. Register this with `--import ./scripts/ts-resolve-hook.mjs` so
// `node --test src/game/*.test.ts` can load them unchanged. It also maps the `@/` alias to src/
// (as tsconfig and Vite do) so a test can load a component helper such as src/components/mend/stage.ts.
import { register } from "node:module";

register(
  "data:text/javascript," +
    encodeURIComponent(`
const SRC = ${JSON.stringify(new URL("../src/", import.meta.url).href)};
export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const path = specifier.slice(2);
    return next(SRC + (/\\.[cm]?[jt]sx?$/.test(path) ? path : path + ".ts"), context);
  }
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
