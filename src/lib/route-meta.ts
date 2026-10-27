export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — Envora` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — Envora` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
