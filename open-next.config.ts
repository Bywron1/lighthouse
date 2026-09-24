import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// The game is one prerendered page with no revalidation, so it's served
// straight from the Worker's static assets.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
