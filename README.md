# Spark

A creative toolkit for kids: a digital studio where AI drafts a playable Spark from anything you're curious about, plus a USB controller called the Spark-Plug. Senior capstone, ATLS 4519, CU Boulder.

| Folder | What it is |
| --- | --- |
| `docs/` | Documentation site |
| `studio/` | Spark Studio (Change It journey prototype) |

## Local preview

No build step. Serve the repo root and open the pages in a browser:

```bash
python3 -m http.server 8080
```

- Docs: http://localhost:8080/docs/
- Studio: http://localhost:8080/studio/

The studio prototype's AI drafting uses the claude.ai artifact runtime, so it only drafts new Sparks inside claude.ai for now.
