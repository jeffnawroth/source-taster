## [2.1.3](https://github.com/jeffnawroth/source-taster/compare/v2.1.2...v2.1.3) (2026-07-27)

### Features

* observability stack mit logging, metrik & dashboard fixes ([9c2b926](https://github.com/jeffnawroth/source-taster/commit/9c2b926f46f0483b35efa42d60710606eaf64574))
* **otel:** Phase 1 – Traces-Panel Fix, Dashboard Cleanup ([aded4cd](https://github.com/jeffnawroth/source-taster/commit/aded4cda952b94fd92fe4d3e7725ad31faf72473))
* **otel:** Phase 1 – Tracing mit OTel Collector + Tempo ([0a47b65](https://github.com/jeffnawroth/source-taster/commit/0a47b6590c13e8fd7ebae21ca7398dc2564b498f))

### Bug Fixes

* add --all flag to bumpp for workspace version bump ([92f192c](https://github.com/jeffnawroth/source-taster/commit/92f192c2f946e33b42f4196afdfaba7eaffabb95))
* add pull-requests write permission to release job ([b0c281b](https://github.com/jeffnawroth/source-taster/commit/b0c281b578ba5865ca1b0a6d7b960ceba1020cff))
* add version field to root package.json for bumpp ([32268bb](https://github.com/jeffnawroth/source-taster/commit/32268bbd8e6ed7183ff338a746dd69fb129b9d0b))
* ci/lint - pnpm action version conflict, [@ts-nocheck](https://github.com/ts-nocheck) entfernt, docs tables formatiert, regex capturing group ([c555afc](https://github.com/jeffnawroth/source-taster/commit/c555afcfd20400766e509eb89bd8e0964cb64647))
* copy all workspace package.json to Docker deps stage ([7969613](https://github.com/jeffnawroth/source-taster/commit/796961372a8c27310f909e23bc71ff9933471c78))
* force local tag creation in release workflow ([2962dbc](https://github.com/jeffnawroth/source-taster/commit/2962dbc7750e70110fea18dde7fb624b9cd2c6a9))
* force-push tags and branches in release workflow ([3ef8dbd](https://github.com/jeffnawroth/source-taster/commit/3ef8dbd6d05b92b0fa0a62a54b04523b72c727e9))
* health endpoint before CORS middleware ([7e82c0e](https://github.com/jeffnawroth/source-taster/commit/7e82c0e5a40e48e6deae20fa0f7d7f92bb2c139d))
* health endpoint bypass CORS via path change /health ([8af2c82](https://github.com/jeffnawroth/source-taster/commit/8af2c82767864d3f673090b563d43c273fe02e78))
* pass tag_name explicitly to release action ([222bcd5](https://github.com/jeffnawroth/source-taster/commit/222bcd517deef21898e4539f5314ac9b2ddd750a))
* prevent release loop by skipping chore(release) commits ([5ad971f](https://github.com/jeffnawroth/source-taster/commit/5ad971f2114becb81d1516365dc252b9cf575385))
* prometheus scrape target host.docker.internal -> api (Linux Docker) ([201bcc9](https://github.com/jeffnawroth/source-taster/commit/201bcc9e69caf86645e33c31de37c53c69192dc1))
* push release via PR instead of direct push ([2b7ab03](https://github.com/jeffnawroth/source-taster/commit/2b7ab0327873dbd6a7646d0695bdbd99c1ff1c28))
* remove --no-cache aus deploy, git in Dockerfiles ([5994701](https://github.com/jeffnawroth/source-taster/commit/59947016c643252f2da81f73791c4a18bd54df72))
* remove elevated variant from match score chip ([cc62494](https://github.com/jeffnawroth/source-taster/commit/cc62494ee741efbe706928e6e38f2d7093cabb8e))
* remove non-existent label from release PR creation ([9cd189c](https://github.com/jeffnawroth/source-taster/commit/9cd189cdad84511cce25ba2836245e1419282a52))
* remove non-matching glob from extension clear script ([661e19e](https://github.com/jeffnawroth/source-taster/commit/661e19ee9a9242d7888bd161b44896167826a070))
* remove unsupported --activate flag from corepack install ([6729ea7](https://github.com/jeffnawroth/source-taster/commit/6729ea73a1b2f7753fbc11868fe624baa500d7c1))
* skip pre-commit hooks in release workflow commit ([6836167](https://github.com/jeffnawroth/source-taster/commit/68361674e27605cc2c3cba1c8a697c42d3f97b1e))
* Tempo v3 Config – remove ingester/compactor, block.block_retention ([4a5c94c](https://github.com/jeffnawroth/source-taster/commit/4a5c94c40ded8c3909484495e85b67fa2ad783e1))
* Tempo v3 Config korrigiert ([83b49b8](https://github.com/jeffnawroth/source-taster/commit/83b49b8d6cecb0ecb80858a2fd17bdc39919f757))
* update GH actions to Node 24 versions (checkout@v7, pnpm@v6, setup-node@v7) ([8d1a380](https://github.com/jeffnawroth/source-taster/commit/8d1a3807cd02625db5d6730fbbf1e7fcc706c522))
* update pnpm-lock.yaml to match docs package.json ([a592aca](https://github.com/jeffnawroth/source-taster/commit/a592aca3cc53ec2fb6ddf16a3197a41e83cc6894))
* use GH_PAT for PR operations in release workflow ([8f98fa5](https://github.com/jeffnawroth/source-taster/commit/8f98fa56fffcb6969fefd449cb3e9f4031697ca8))
* zod version mismatch - align types package zod@^4.4.3, move to dependencies ([0881d3a](https://github.com/jeffnawroth/source-taster/commit/0881d3ad6be220e7cd8ebe335effe496f906b476))
## [2.1.3](https://github.com/jeffnawroth/source-taster/compare/v2.1.2...v2.1.3) (2026-07-27)

### Features

* observability stack mit logging, metrik & dashboard fixes ([9c2b926](https://github.com/jeffnawroth/source-taster/commit/9c2b926f46f0483b35efa42d60710606eaf64574))
* **otel:** Phase 1 – Traces-Panel Fix, Dashboard Cleanup ([aded4cd](https://github.com/jeffnawroth/source-taster/commit/aded4cda952b94fd92fe4d3e7725ad31faf72473))
* **otel:** Phase 1 – Tracing mit OTel Collector + Tempo ([0a47b65](https://github.com/jeffnawroth/source-taster/commit/0a47b6590c13e8fd7ebae21ca7398dc2564b498f))

### Bug Fixes

* add --all flag to bumpp for workspace version bump ([92f192c](https://github.com/jeffnawroth/source-taster/commit/92f192c2f946e33b42f4196afdfaba7eaffabb95))
* add pull-requests write permission to release job ([b0c281b](https://github.com/jeffnawroth/source-taster/commit/b0c281b578ba5865ca1b0a6d7b960ceba1020cff))
* add version field to root package.json for bumpp ([32268bb](https://github.com/jeffnawroth/source-taster/commit/32268bbd8e6ed7183ff338a746dd69fb129b9d0b))
* ci/lint - pnpm action version conflict, [@ts-nocheck](https://github.com/ts-nocheck) entfernt, docs tables formatiert, regex capturing group ([c555afc](https://github.com/jeffnawroth/source-taster/commit/c555afcfd20400766e509eb89bd8e0964cb64647))
* copy all workspace package.json to Docker deps stage ([7969613](https://github.com/jeffnawroth/source-taster/commit/796961372a8c27310f909e23bc71ff9933471c78))
* force local tag creation in release workflow ([2962dbc](https://github.com/jeffnawroth/source-taster/commit/2962dbc7750e70110fea18dde7fb624b9cd2c6a9))
* force-push tags and branches in release workflow ([3ef8dbd](https://github.com/jeffnawroth/source-taster/commit/3ef8dbd6d05b92b0fa0a62a54b04523b72c727e9))
* health endpoint before CORS middleware ([7e82c0e](https://github.com/jeffnawroth/source-taster/commit/7e82c0e5a40e48e6deae20fa0f7d7f92bb2c139d))
* health endpoint bypass CORS via path change /health ([8af2c82](https://github.com/jeffnawroth/source-taster/commit/8af2c82767864d3f673090b563d43c273fe02e78))
* pass tag_name explicitly to release action ([222bcd5](https://github.com/jeffnawroth/source-taster/commit/222bcd517deef21898e4539f5314ac9b2ddd750a))
* prometheus scrape target host.docker.internal -> api (Linux Docker) ([201bcc9](https://github.com/jeffnawroth/source-taster/commit/201bcc9e69caf86645e33c31de37c53c69192dc1))
* push release via PR instead of direct push ([2b7ab03](https://github.com/jeffnawroth/source-taster/commit/2b7ab0327873dbd6a7646d0695bdbd99c1ff1c28))
* remove --no-cache aus deploy, git in Dockerfiles ([5994701](https://github.com/jeffnawroth/source-taster/commit/59947016c643252f2da81f73791c4a18bd54df72))
* remove elevated variant from match score chip ([cc62494](https://github.com/jeffnawroth/source-taster/commit/cc62494ee741efbe706928e6e38f2d7093cabb8e))
* remove non-existent label from release PR creation ([9cd189c](https://github.com/jeffnawroth/source-taster/commit/9cd189cdad84511cce25ba2836245e1419282a52))
* remove non-matching glob from extension clear script ([661e19e](https://github.com/jeffnawroth/source-taster/commit/661e19ee9a9242d7888bd161b44896167826a070))
* remove unsupported --activate flag from corepack install ([6729ea7](https://github.com/jeffnawroth/source-taster/commit/6729ea73a1b2f7753fbc11868fe624baa500d7c1))
* skip pre-commit hooks in release workflow commit ([6836167](https://github.com/jeffnawroth/source-taster/commit/68361674e27605cc2c3cba1c8a697c42d3f97b1e))
* Tempo v3 Config – remove ingester/compactor, block.block_retention ([4a5c94c](https://github.com/jeffnawroth/source-taster/commit/4a5c94c40ded8c3909484495e85b67fa2ad783e1))
* Tempo v3 Config korrigiert ([83b49b8](https://github.com/jeffnawroth/source-taster/commit/83b49b8d6cecb0ecb80858a2fd17bdc39919f757))
* update GH actions to Node 24 versions (checkout@v7, pnpm@v6, setup-node@v7) ([8d1a380](https://github.com/jeffnawroth/source-taster/commit/8d1a3807cd02625db5d6730fbbf1e7fcc706c522))
* update pnpm-lock.yaml to match docs package.json ([a592aca](https://github.com/jeffnawroth/source-taster/commit/a592aca3cc53ec2fb6ddf16a3197a41e83cc6894))
* use GH_PAT for PR operations in release workflow ([8f98fa5](https://github.com/jeffnawroth/source-taster/commit/8f98fa56fffcb6969fefd449cb3e9f4031697ca8))
* zod version mismatch - align types package zod@^4.4.3, move to dependencies ([0881d3a](https://github.com/jeffnawroth/source-taster/commit/0881d3ad6be220e7cd8ebe335effe496f906b476))
## [2.1.3](https://github.com/jeffnawroth/source-taster/compare/v2.1.2...v2.1.3) (2026-07-27)

### Features

* observability stack mit logging, metrik & dashboard fixes ([9c2b926](https://github.com/jeffnawroth/source-taster/commit/9c2b926f46f0483b35efa42d60710606eaf64574))
* **otel:** Phase 1 – Traces-Panel Fix, Dashboard Cleanup ([aded4cd](https://github.com/jeffnawroth/source-taster/commit/aded4cda952b94fd92fe4d3e7725ad31faf72473))
* **otel:** Phase 1 – Tracing mit OTel Collector + Tempo ([0a47b65](https://github.com/jeffnawroth/source-taster/commit/0a47b6590c13e8fd7ebae21ca7398dc2564b498f))

### Bug Fixes

* add --all flag to bumpp for workspace version bump ([92f192c](https://github.com/jeffnawroth/source-taster/commit/92f192c2f946e33b42f4196afdfaba7eaffabb95))
* add pull-requests write permission to release job ([b0c281b](https://github.com/jeffnawroth/source-taster/commit/b0c281b578ba5865ca1b0a6d7b960ceba1020cff))
* add version field to root package.json for bumpp ([32268bb](https://github.com/jeffnawroth/source-taster/commit/32268bbd8e6ed7183ff338a746dd69fb129b9d0b))
* ci/lint - pnpm action version conflict, [@ts-nocheck](https://github.com/ts-nocheck) entfernt, docs tables formatiert, regex capturing group ([c555afc](https://github.com/jeffnawroth/source-taster/commit/c555afcfd20400766e509eb89bd8e0964cb64647))
* copy all workspace package.json to Docker deps stage ([7969613](https://github.com/jeffnawroth/source-taster/commit/796961372a8c27310f909e23bc71ff9933471c78))
* force local tag creation in release workflow ([2962dbc](https://github.com/jeffnawroth/source-taster/commit/2962dbc7750e70110fea18dde7fb624b9cd2c6a9))
* force-push tags and branches in release workflow ([3ef8dbd](https://github.com/jeffnawroth/source-taster/commit/3ef8dbd6d05b92b0fa0a62a54b04523b72c727e9))
* health endpoint before CORS middleware ([7e82c0e](https://github.com/jeffnawroth/source-taster/commit/7e82c0e5a40e48e6deae20fa0f7d7f92bb2c139d))
* health endpoint bypass CORS via path change /health ([8af2c82](https://github.com/jeffnawroth/source-taster/commit/8af2c82767864d3f673090b563d43c273fe02e78))
* pass tag_name explicitly to release action ([222bcd5](https://github.com/jeffnawroth/source-taster/commit/222bcd517deef21898e4539f5314ac9b2ddd750a))
* prometheus scrape target host.docker.internal -> api (Linux Docker) ([201bcc9](https://github.com/jeffnawroth/source-taster/commit/201bcc9e69caf86645e33c31de37c53c69192dc1))
* push release via PR instead of direct push ([2b7ab03](https://github.com/jeffnawroth/source-taster/commit/2b7ab0327873dbd6a7646d0695bdbd99c1ff1c28))
* remove --no-cache aus deploy, git in Dockerfiles ([5994701](https://github.com/jeffnawroth/source-taster/commit/59947016c643252f2da81f73791c4a18bd54df72))
* remove elevated variant from match score chip ([cc62494](https://github.com/jeffnawroth/source-taster/commit/cc62494ee741efbe706928e6e38f2d7093cabb8e))
* remove non-existent label from release PR creation ([9cd189c](https://github.com/jeffnawroth/source-taster/commit/9cd189cdad84511cce25ba2836245e1419282a52))
* remove non-matching glob from extension clear script ([661e19e](https://github.com/jeffnawroth/source-taster/commit/661e19ee9a9242d7888bd161b44896167826a070))
* skip pre-commit hooks in release workflow commit ([6836167](https://github.com/jeffnawroth/source-taster/commit/68361674e27605cc2c3cba1c8a697c42d3f97b1e))
* Tempo v3 Config – remove ingester/compactor, block.block_retention ([4a5c94c](https://github.com/jeffnawroth/source-taster/commit/4a5c94c40ded8c3909484495e85b67fa2ad783e1))
* Tempo v3 Config korrigiert ([83b49b8](https://github.com/jeffnawroth/source-taster/commit/83b49b8d6cecb0ecb80858a2fd17bdc39919f757))
* update GH actions to Node 24 versions (checkout@v7, pnpm@v6, setup-node@v7) ([8d1a380](https://github.com/jeffnawroth/source-taster/commit/8d1a3807cd02625db5d6730fbbf1e7fcc706c522))
* update pnpm-lock.yaml to match docs package.json ([a592aca](https://github.com/jeffnawroth/source-taster/commit/a592aca3cc53ec2fb6ddf16a3197a41e83cc6894))
* use GH_PAT for PR operations in release workflow ([8f98fa5](https://github.com/jeffnawroth/source-taster/commit/8f98fa56fffcb6969fefd449cb3e9f4031697ca8))
* zod version mismatch - align types package zod@^4.4.3, move to dependencies ([0881d3a](https://github.com/jeffnawroth/source-taster/commit/0881d3ad6be220e7cd8ebe335effe496f906b476))
## [2.1.3](https://github.com/jeffnawroth/source-taster/compare/v2.1.2...v2.1.3) (2026-07-27)

### Features

* observability stack mit logging, metrik & dashboard fixes ([9c2b926](https://github.com/jeffnawroth/source-taster/commit/9c2b926f46f0483b35efa42d60710606eaf64574))
* **otel:** Phase 1 – Traces-Panel Fix, Dashboard Cleanup ([aded4cd](https://github.com/jeffnawroth/source-taster/commit/aded4cda952b94fd92fe4d3e7725ad31faf72473))
* **otel:** Phase 1 – Tracing mit OTel Collector + Tempo ([0a47b65](https://github.com/jeffnawroth/source-taster/commit/0a47b6590c13e8fd7ebae21ca7398dc2564b498f))

### Bug Fixes

* add --all flag to bumpp for workspace version bump ([92f192c](https://github.com/jeffnawroth/source-taster/commit/92f192c2f946e33b42f4196afdfaba7eaffabb95))
* add pull-requests write permission to release job ([b0c281b](https://github.com/jeffnawroth/source-taster/commit/b0c281b578ba5865ca1b0a6d7b960ceba1020cff))
* add version field to root package.json for bumpp ([32268bb](https://github.com/jeffnawroth/source-taster/commit/32268bbd8e6ed7183ff338a746dd69fb129b9d0b))
* ci/lint - pnpm action version conflict, [@ts-nocheck](https://github.com/ts-nocheck) entfernt, docs tables formatiert, regex capturing group ([c555afc](https://github.com/jeffnawroth/source-taster/commit/c555afcfd20400766e509eb89bd8e0964cb64647))
* copy all workspace package.json to Docker deps stage ([7969613](https://github.com/jeffnawroth/source-taster/commit/796961372a8c27310f909e23bc71ff9933471c78))
* force local tag creation in release workflow ([2962dbc](https://github.com/jeffnawroth/source-taster/commit/2962dbc7750e70110fea18dde7fb624b9cd2c6a9))
* force-push tags and branches in release workflow ([3ef8dbd](https://github.com/jeffnawroth/source-taster/commit/3ef8dbd6d05b92b0fa0a62a54b04523b72c727e9))
* health endpoint before CORS middleware ([7e82c0e](https://github.com/jeffnawroth/source-taster/commit/7e82c0e5a40e48e6deae20fa0f7d7f92bb2c139d))
* health endpoint bypass CORS via path change /health ([8af2c82](https://github.com/jeffnawroth/source-taster/commit/8af2c82767864d3f673090b563d43c273fe02e78))
* pass tag_name explicitly to release action ([222bcd5](https://github.com/jeffnawroth/source-taster/commit/222bcd517deef21898e4539f5314ac9b2ddd750a))
* prometheus scrape target host.docker.internal -> api (Linux Docker) ([201bcc9](https://github.com/jeffnawroth/source-taster/commit/201bcc9e69caf86645e33c31de37c53c69192dc1))
* push release via PR instead of direct push ([2b7ab03](https://github.com/jeffnawroth/source-taster/commit/2b7ab0327873dbd6a7646d0695bdbd99c1ff1c28))
* remove --no-cache aus deploy, git in Dockerfiles ([5994701](https://github.com/jeffnawroth/source-taster/commit/59947016c643252f2da81f73791c4a18bd54df72))
* remove elevated variant from match score chip ([cc62494](https://github.com/jeffnawroth/source-taster/commit/cc62494ee741efbe706928e6e38f2d7093cabb8e))
* remove non-existent label from release PR creation ([9cd189c](https://github.com/jeffnawroth/source-taster/commit/9cd189cdad84511cce25ba2836245e1419282a52))
* remove non-matching glob from extension clear script ([661e19e](https://github.com/jeffnawroth/source-taster/commit/661e19ee9a9242d7888bd161b44896167826a070))
* skip pre-commit hooks in release workflow commit ([6836167](https://github.com/jeffnawroth/source-taster/commit/68361674e27605cc2c3cba1c8a697c42d3f97b1e))
* Tempo v3 Config – remove ingester/compactor, block.block_retention ([4a5c94c](https://github.com/jeffnawroth/source-taster/commit/4a5c94c40ded8c3909484495e85b67fa2ad783e1))
* Tempo v3 Config korrigiert ([83b49b8](https://github.com/jeffnawroth/source-taster/commit/83b49b8d6cecb0ecb80858a2fd17bdc39919f757))
* update GH actions to Node 24 versions (checkout@v7, pnpm@v6, setup-node@v7) ([8d1a380](https://github.com/jeffnawroth/source-taster/commit/8d1a3807cd02625db5d6730fbbf1e7fcc706c522))
* update pnpm-lock.yaml to match docs package.json ([a592aca](https://github.com/jeffnawroth/source-taster/commit/a592aca3cc53ec2fb6ddf16a3197a41e83cc6894))
* use GH_PAT for PR operations in release workflow ([8f98fa5](https://github.com/jeffnawroth/source-taster/commit/8f98fa56fffcb6969fefd449cb3e9f4031697ca8))
* zod version mismatch - align types package zod@^4.4.3, move to dependencies ([0881d3a](https://github.com/jeffnawroth/source-taster/commit/0881d3ad6be220e7cd8ebe335effe496f906b476))
## [2.1.3](https://github.com/jeffnawroth/source-taster/compare/v2.1.2...v2.1.3) (2026-07-27)

### Features

* observability stack mit logging, metrik & dashboard fixes ([9c2b926](https://github.com/jeffnawroth/source-taster/commit/9c2b926f46f0483b35efa42d60710606eaf64574))
* **otel:** Phase 1 – Traces-Panel Fix, Dashboard Cleanup ([aded4cd](https://github.com/jeffnawroth/source-taster/commit/aded4cda952b94fd92fe4d3e7725ad31faf72473))
* **otel:** Phase 1 – Tracing mit OTel Collector + Tempo ([0a47b65](https://github.com/jeffnawroth/source-taster/commit/0a47b6590c13e8fd7ebae21ca7398dc2564b498f))

### Bug Fixes

* add --all flag to bumpp for workspace version bump ([92f192c](https://github.com/jeffnawroth/source-taster/commit/92f192c2f946e33b42f4196afdfaba7eaffabb95))
* add pull-requests write permission to release job ([b0c281b](https://github.com/jeffnawroth/source-taster/commit/b0c281b578ba5865ca1b0a6d7b960ceba1020cff))
* add version field to root package.json for bumpp ([32268bb](https://github.com/jeffnawroth/source-taster/commit/32268bbd8e6ed7183ff338a746dd69fb129b9d0b))
* ci/lint - pnpm action version conflict, [@ts-nocheck](https://github.com/ts-nocheck) entfernt, docs tables formatiert, regex capturing group ([c555afc](https://github.com/jeffnawroth/source-taster/commit/c555afcfd20400766e509eb89bd8e0964cb64647))
* copy all workspace package.json to Docker deps stage ([7969613](https://github.com/jeffnawroth/source-taster/commit/796961372a8c27310f909e23bc71ff9933471c78))
* force local tag creation in release workflow ([2962dbc](https://github.com/jeffnawroth/source-taster/commit/2962dbc7750e70110fea18dde7fb624b9cd2c6a9))
* force-push tags and branches in release workflow ([3ef8dbd](https://github.com/jeffnawroth/source-taster/commit/3ef8dbd6d05b92b0fa0a62a54b04523b72c727e9))
* health endpoint before CORS middleware ([7e82c0e](https://github.com/jeffnawroth/source-taster/commit/7e82c0e5a40e48e6deae20fa0f7d7f92bb2c139d))
* health endpoint bypass CORS via path change /health ([8af2c82](https://github.com/jeffnawroth/source-taster/commit/8af2c82767864d3f673090b563d43c273fe02e78))
* prometheus scrape target host.docker.internal -> api (Linux Docker) ([201bcc9](https://github.com/jeffnawroth/source-taster/commit/201bcc9e69caf86645e33c31de37c53c69192dc1))
* push release via PR instead of direct push ([2b7ab03](https://github.com/jeffnawroth/source-taster/commit/2b7ab0327873dbd6a7646d0695bdbd99c1ff1c28))
* remove --no-cache aus deploy, git in Dockerfiles ([5994701](https://github.com/jeffnawroth/source-taster/commit/59947016c643252f2da81f73791c4a18bd54df72))
* remove elevated variant from match score chip ([cc62494](https://github.com/jeffnawroth/source-taster/commit/cc62494ee741efbe706928e6e38f2d7093cabb8e))
* remove non-existent label from release PR creation ([9cd189c](https://github.com/jeffnawroth/source-taster/commit/9cd189cdad84511cce25ba2836245e1419282a52))
* remove non-matching glob from extension clear script ([661e19e](https://github.com/jeffnawroth/source-taster/commit/661e19ee9a9242d7888bd161b44896167826a070))
* skip pre-commit hooks in release workflow commit ([6836167](https://github.com/jeffnawroth/source-taster/commit/68361674e27605cc2c3cba1c8a697c42d3f97b1e))
* Tempo v3 Config – remove ingester/compactor, block.block_retention ([4a5c94c](https://github.com/jeffnawroth/source-taster/commit/4a5c94c40ded8c3909484495e85b67fa2ad783e1))
* Tempo v3 Config korrigiert ([83b49b8](https://github.com/jeffnawroth/source-taster/commit/83b49b8d6cecb0ecb80858a2fd17bdc39919f757))
* update GH actions to Node 24 versions (checkout@v7, pnpm@v6, setup-node@v7) ([8d1a380](https://github.com/jeffnawroth/source-taster/commit/8d1a3807cd02625db5d6730fbbf1e7fcc706c522))
* update pnpm-lock.yaml to match docs package.json ([a592aca](https://github.com/jeffnawroth/source-taster/commit/a592aca3cc53ec2fb6ddf16a3197a41e83cc6894))
* use GH_PAT for PR operations in release workflow ([8f98fa5](https://github.com/jeffnawroth/source-taster/commit/8f98fa56fffcb6969fefd449cb3e9f4031697ca8))
* zod version mismatch - align types package zod@^4.4.3, move to dependencies ([0881d3a](https://github.com/jeffnawroth/source-taster/commit/0881d3ad6be220e7cd8ebe335effe496f906b476))
## [2.1.3](https://github.com/jeffnawroth/source-taster/compare/v2.1.2...v2.1.3) (2026-07-27)

### Features

* observability stack mit logging, metrik & dashboard fixes ([9c2b926](https://github.com/jeffnawroth/source-taster/commit/9c2b926f46f0483b35efa42d60710606eaf64574))
* **otel:** Phase 1 – Traces-Panel Fix, Dashboard Cleanup ([aded4cd](https://github.com/jeffnawroth/source-taster/commit/aded4cda952b94fd92fe4d3e7725ad31faf72473))
* **otel:** Phase 1 – Tracing mit OTel Collector + Tempo ([0a47b65](https://github.com/jeffnawroth/source-taster/commit/0a47b6590c13e8fd7ebae21ca7398dc2564b498f))

### Bug Fixes

* add --all flag to bumpp for workspace version bump ([92f192c](https://github.com/jeffnawroth/source-taster/commit/92f192c2f946e33b42f4196afdfaba7eaffabb95))
* add pull-requests write permission to release job ([b0c281b](https://github.com/jeffnawroth/source-taster/commit/b0c281b578ba5865ca1b0a6d7b960ceba1020cff))
* add version field to root package.json for bumpp ([32268bb](https://github.com/jeffnawroth/source-taster/commit/32268bbd8e6ed7183ff338a746dd69fb129b9d0b))
* ci/lint - pnpm action version conflict, [@ts-nocheck](https://github.com/ts-nocheck) entfernt, docs tables formatiert, regex capturing group ([c555afc](https://github.com/jeffnawroth/source-taster/commit/c555afcfd20400766e509eb89bd8e0964cb64647))
* copy all workspace package.json to Docker deps stage ([7969613](https://github.com/jeffnawroth/source-taster/commit/796961372a8c27310f909e23bc71ff9933471c78))
* force local tag creation in release workflow ([2962dbc](https://github.com/jeffnawroth/source-taster/commit/2962dbc7750e70110fea18dde7fb624b9cd2c6a9))
* force-push tags and branches in release workflow ([3ef8dbd](https://github.com/jeffnawroth/source-taster/commit/3ef8dbd6d05b92b0fa0a62a54b04523b72c727e9))
* health endpoint before CORS middleware ([7e82c0e](https://github.com/jeffnawroth/source-taster/commit/7e82c0e5a40e48e6deae20fa0f7d7f92bb2c139d))
* health endpoint bypass CORS via path change /health ([8af2c82](https://github.com/jeffnawroth/source-taster/commit/8af2c82767864d3f673090b563d43c273fe02e78))
* prometheus scrape target host.docker.internal -> api (Linux Docker) ([201bcc9](https://github.com/jeffnawroth/source-taster/commit/201bcc9e69caf86645e33c31de37c53c69192dc1))
* push release via PR instead of direct push ([2b7ab03](https://github.com/jeffnawroth/source-taster/commit/2b7ab0327873dbd6a7646d0695bdbd99c1ff1c28))
* remove --no-cache aus deploy, git in Dockerfiles ([5994701](https://github.com/jeffnawroth/source-taster/commit/59947016c643252f2da81f73791c4a18bd54df72))
* remove elevated variant from match score chip ([cc62494](https://github.com/jeffnawroth/source-taster/commit/cc62494ee741efbe706928e6e38f2d7093cabb8e))
* remove non-existent label from release PR creation ([9cd189c](https://github.com/jeffnawroth/source-taster/commit/9cd189cdad84511cce25ba2836245e1419282a52))
* remove non-matching glob from extension clear script ([661e19e](https://github.com/jeffnawroth/source-taster/commit/661e19ee9a9242d7888bd161b44896167826a070))
* skip pre-commit hooks in release workflow commit ([6836167](https://github.com/jeffnawroth/source-taster/commit/68361674e27605cc2c3cba1c8a697c42d3f97b1e))
* Tempo v3 Config – remove ingester/compactor, block.block_retention ([4a5c94c](https://github.com/jeffnawroth/source-taster/commit/4a5c94c40ded8c3909484495e85b67fa2ad783e1))
* Tempo v3 Config korrigiert ([83b49b8](https://github.com/jeffnawroth/source-taster/commit/83b49b8d6cecb0ecb80858a2fd17bdc39919f757))
* update GH actions to Node 24 versions (checkout@v7, pnpm@v6, setup-node@v7) ([8d1a380](https://github.com/jeffnawroth/source-taster/commit/8d1a3807cd02625db5d6730fbbf1e7fcc706c522))
* update pnpm-lock.yaml to match docs package.json ([a592aca](https://github.com/jeffnawroth/source-taster/commit/a592aca3cc53ec2fb6ddf16a3197a41e83cc6894))
* use GH_PAT for PR operations in release workflow ([8f98fa5](https://github.com/jeffnawroth/source-taster/commit/8f98fa56fffcb6969fefd449cb3e9f4031697ca8))
* zod version mismatch - align types package zod@^4.4.3, move to dependencies ([0881d3a](https://github.com/jeffnawroth/source-taster/commit/0881d3ad6be220e7cd8ebe335effe496f906b476))
# Changelog

All notable changes to Source Taster will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).
