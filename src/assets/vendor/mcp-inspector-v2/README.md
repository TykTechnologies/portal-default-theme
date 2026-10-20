# Vendored MCP Inspector SPA

Build output from upstream `modelcontextprotocol/inspector` v2.9.0 (rev
`ae865a1`), with a patch script applied (see "Regenerating" below): it makes
the bundle relocatable and makes the OAuth authorization redirect break out of
the iframe
the portal embeds it in (auth servers refuse to be framed, so an in-frame
redirect dead-ends on a browser error instead of showing the login page).

Do not hand-edit anything in this directory.

## Licensing

Upstream is mid-transition from the MIT License to Apache-2.0: new contributions
are Apache-2.0, contributions whose authors have not consented to relicensing
remain MIT, and documentation is CC-BY-4.0. The bundle therefore carries a mix,
plus the licences of the web client's transitive dependencies.

**No licence text or NOTICE is vendored beside the bundle.** Apache-2.0 §4 asks
a redistribution to carry both, so confirm what attribution this product owes
before shipping it externally — it is a deliberate open question, not an
oversight. Upstream's own LICENSE at rev `ae865a1` is the authoritative text.

**The bundle carries no mount path.** Asset URLs are relative and the app
derives its API base from `document.baseURI`, which resolves the `<base href>`
the Go handler writes into `index.html` per request. One build therefore serves
any mount depth, including a prefix that varies per request such as a
per-product route.

## Why it is committed

The portal ships self-contained and is frequently run air-gapped. Vendoring the
build output keeps the app version-pinned and available without a network round
trip, and means no normal build step clones or executes third-party sources.
This mirrors what the V1 bundle already does.

## Regenerating

    git clone https://github.com/modelcontextprotocol/inspector
    cd inspector && git checkout 2.9.0
    /path/to/patch-spa.sh .
    npm install
    npm run build:web
    cp -r clients/web/dist/* /path/to/portal/themes/default/assets/vendor/mcp-inspector-v2/

`patch-spa.sh` is not committed here: it is a one-off build tool, needed only
when the bundle is regenerated, not to build or run the portal. Ask the MCP
Inspector maintainer for the current copy rather than reconstructing it — the
iframe-redirect patch in particular is easy to get subtly wrong, and a wrong one
produces a bundle whose OAuth flow dead-ends on a browser error.

Upstream dropped npm workspaces in 2.9.0, so this is `npm run build:web` from
the repository root rather than `npm run build --workspace clients/web`.

Build outside this repository so nothing here fetches or runs third-party code.

## Note

`index.html` requests Google Fonts from a CDN. Those requests fail closed in an
air-gapped deployment: the app renders with fallback fonts and works normally.
Removing them would mean patching the built HTML, which is deliberately avoided.
