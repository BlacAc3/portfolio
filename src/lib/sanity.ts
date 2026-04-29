import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const client = createClient({
  projectId: "wov9veyj",
  dataset: "production",
  useCdn: true,
  apiVersion: "2024-04-30", // Use today's date or latest
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}
