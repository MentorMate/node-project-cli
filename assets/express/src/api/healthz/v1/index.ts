import { healthzLive } from "./live";
import { healthzReady } from "./ready";

export function healthzControllerFactory() {
  return {
    live: healthzLive,
    ready: healthzReady
  }
}
