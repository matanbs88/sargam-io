/**
 * A small, provider-neutral analytics seam for the waitlist preview.
 *
 * The client never sends email addresses, source audio, URLs, or note data.
 * Until a consented analytics endpoint is configured, events are observable
 * locally through a browser CustomEvent for development and QA.
 */
export type ProductEventName =
  | "demo_opened"
  | "instrument_selected"
  | "catalog_song_opened"
  | "waitlist_started"
  | "waitlist_completed";

export type ProductEventProperties = Readonly<Record<string, string | number | boolean>>;

export function trackProductEvent(
  name: ProductEventName,
  properties: ProductEventProperties = {},
): void {
  if (typeof window === "undefined") return;

  const eventDetail = { name, properties, timestamp: new Date().toISOString() };
  window.dispatchEvent(new CustomEvent("sargam:analytics", { detail: eventDetail }));

  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  if (endpoint === undefined || endpoint.trim().length === 0) return;

  void fetch(endpoint, {
    body: JSON.stringify(eventDetail),
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch(() => {
    // Analytics must never interrupt practice or change the user experience.
  });
}
