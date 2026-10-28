# DOI adapter fixtures

Recorded on 2026-10-27, directly from these public metadata endpoints:

- `crossref-nphys1170.json`: https://api.crossref.org/works/10.1038/nphys1170
- `crossref-171737a0.json`: https://api.crossref.org/works/10.1038/171737a0
- `handle-nphys1170.json`: https://doi.org/api/handles/10.1038/nphys1170
- `handle-nonexistent.json`: https://doi.org/api/handles/10.5555/source-taster-fixture-nonexistent

The Crossref records are public bibliographic metadata. Crossref's metadata
policy permits reuse under CC0: https://www.crossref.org/documentation/retrieve-metadata/rest-api/ .
Publisher full-text rights and any license URLs inside a record are separate;
no full text was retrieved. Preserve these raw responses as source evidence.

The Handle responses record public DOI facts under the agency-neutral API:
https://www.doi.org/the-identifier/resources/factsheets/doi-resolution-documentation/ .
No affirmative blanket license or launch clearance for the DOI Foundation is
asserted. Source usage/storage permission qualification remains required before
launch. These tiny public factual protocol observations are development fixtures,
not a source-rights approval, private corpus or held-out evaluation dataset.

Tests replay these bytes only from loopback HTTP servers. Outages, alternate
identifiers, comparison examples and the wrong-DOI combination are explicitly
synthetic modifications in the tests, never claimed as recorded provider truth.
No customer content, credentials, purchased access, email or live source call
is used during a test. Recording used only the public identifiers above.
