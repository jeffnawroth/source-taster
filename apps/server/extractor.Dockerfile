# SPDX-License-Identifier: AGPL-3.0-or-later
# Node 24.14.0 LTS, multi-platform immutable upstream image. This is a local
# development/CI boundary, not evidence of Scalingo deployment qualification.
FROM node:24.14.0-bookworm-slim@sha256:d8e448a56fc63242f70026718378bd4b00f8c82e78d20eefb199224a4d8e33d8
WORKDIR /extractor
COPY --chown=65534:65534 . /extractor/
USER 65534:65534
ENTRYPOINT ["node", "--max-old-space-size=1024", "/extractor/extractor.mjs"]
