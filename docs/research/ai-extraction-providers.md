# AI extraction provider capabilities

Research for [AI extraction provider capabilities (#7)](https://github.com/jeffnawroth/source-taster/issues/7). Research date: 2026-10-24. Status: complete.

Scope: evidence only; no model is chosen here (that is [AI provider and model (#19)](https://github.com/jeffnawroth/source-taster/issues/19)). No user documents were sent anywhere and no accounts were provisioned. Sources are public primary sources (official docs, policies, pricing pages).

## Requirements this research is measured against

- **FA-STR-01**: original text plus structured data in CSL must be stored per reference, so the AI output must map to CSL-JSON fields.
- **FA-STR-02**: at least 90 % of references per citation style (APA, MLA, Chicago, IEEE, Vancouver, Harvard, ACS, AMA, Oxford, Springer, DIN ISO 690) structured correctly via AI extraction on the Reference test set (section 14.4).
- **FA-STR-03 / FA-KTO-16**: AI extraction runs in paid plans on the operator's key (no user key).
- **FA-STR-05 / FA-STR-06**: structuring happens before the check, consumes no quota, and must report "no references recognized".
- **FA-STR-07 / FA-STR-08**: AI results carry a notice; fields the AI added or changed must be recognizable, which requires comparing the AI output against the original text.
- **FA-UEB-12**: references go only to data sources and the AI provider; the AI provider may neither train on them nor store them beyond processing. Acceptance: "The contracts with the AI providers exclude training and storage."
- **FA-UEB-13**: account and verification data stored in the EU; non-EU service providers only with GDPR-compliant safeguards.
- **FA-UEB-14** (deferred): organizations can choose processing exclusively within the EU, which is the launch hook to keep open.
- **FA-BTR-05**: the operator can switch the model without user impact; only providers meeting FA-UEB-12/13 are allowed; quality measurement (FA-UEB-30) and FA-UEB-12/13 evidence must exist before the switch.
- **FA-UEB-30 and section 14.4**: quality targets (AI path: at least 93 % "Correct" on real APA references, at most 1 % false alarms) are measured on every model change. A deterioration blocks the release.
- **FA-UEB-40 to 43**: mean 3 s per findable reference, first verdicts within 10 s, 100 references within 3 min, 50 concurrent checks. Structuring latency counts against these budgets.
- **FA-ERF-12**: up to 20 MB files and 1,000 references per check.
- **FA-KON-20 / FA-STR-04** (deferred): BYOK for OpenAI, Anthropic or Google, others only if they meet FA-UEB-12/13.

Terms used: **Storage at rest** is where content is persisted, if at all. **Processing (inference) location** is where the model actually runs. **Abuse-monitoring retention** is temporary retention of prompts and outputs for trust and safety review. **ZDR** is a provider's contractual "zero data retention" arrangement. A provider can offer EU storage without EU processing; the two are kept apart below.

## Provider findings

### OpenAI (direct API)

Verified facts:

- No training on API data unless the customer opts in (since 2023-03-01). Source: [OpenAI, Your data](https://developers.openai.com/api/docs/guides/your-data).
- Default abuse-monitoring retention: up to 30 days for all API features, longer if required by law or to protect the services. Source: same page.
- **ZDR and Modified Abuse Monitoring (MAM)** both remove customer content from abuse-monitoring logs. ZDR additionally forces `store=false` on `/v1/responses` and `/v1/chat/completions`. Both **require prior approval by OpenAI (contact sales)** and acceptance of additional requirements. Exception even under ZDR/MAM: image and file inputs with CSAM classifier hits are retained for manual review. Source: same page.
- Per-endpoint table: `/v1/chat/completions` has no application state (exceptions: audio outputs 1 h, prompt caching up to 24 h) and is "ZDR eligible, with limitations". `/v1/responses` keeps no state by default, 30 days when `store=true` (the default when omitted), and about 10 minutes in background mode. **`/v1/files` and `/v1/batches` are not ZDR-eligible** and keep data until deleted. Source: same page.
- **Data residency, Europe (EEA + Switzerland): both regional storage and regional processing (inference) are available.** It is a per-project setting, and eligibility must be checked with sales. Europe requires ZDR, MAM, "Private Retention with PSP" or "Safety Retention"; non-US regions need approval for abuse-monitoring controls and a Modified Retention amendment. Regional domain example: `eu.api.openai.com`. Source: same page.
- Residency does **not** cover system data (account data, metadata, usage, billing, support), and **the structured-output JSON schema is classed as system data**. Chat completions cannot use `store=true` in non-US regions. Source: same page.
- Residency pricing: 10 % uplift for residency-eligible models released on or after 2026-03-05. Source: same page.
- Standard list prices per 1M tokens (input / cached input / output, prompts of 272K tokens or fewer): gpt-6-luna $0.10 / $0.01 / $0.50, gpt-5.6-luna $0.20 / $0.02 / $1.20, gpt-5-nano $0.05 / $0.005 / $0.40, gpt-5.4-mini $0.75 / $0.075 / $4.50, gpt-6-sol $2.00 / $0.20 / $10.00, gpt-6-astra $10 / $1 / $50. Regional processing costs +10 % for models released on or after 2026-03-05. Context windows are not stated on the pricing page. Source: https://developers.openai.com/api/docs/pricing
- Not verified: context windows, structured-output schema limits per model, and which models are residency-eligible in Europe.

Implication: OpenAI is the only direct provider found with documented **EU inference** on its own API. The path runs through sales approval plus ZDR/MAM, so it is contractual and not self-serve.

### Anthropic (direct Claude API)

Verified facts:

- Default commercial retention: "we automatically delete inputs and outputs on our backend within 30 days of receipt or generation". Exceptions are the Files API, ZDR agreements, Usage Policy enforcement and legal requirements. Flagged content: inputs/outputs up to 2 years, trust and safety classification scores up to 7 years. Source: [Anthropic Privacy Center, commercial data retention](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data). The developer docs say that "Conversation content ... is not retained by default" except for Covered Models. The two Anthropic statements differ in wording, so contract confirmation is needed. Source: [Claude docs, API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention).
- Retained data "is never used for model training without your express permission". Source: [API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention).
- **ZDR**: Anthropic does not store prompts or responses at rest after the response is returned. It is requested via sales and enabled per organization. It covers the Messages and Token Counting APIs for eligible features. **Even under ZDR, flagged content can be retained for up to 2 years**, as can data required by law. ZDR orgs cannot use CORS. Source: same page.
- Feature eligibility under ZDR: **structured outputs and strict tool use are "Yes (qualified)"** because prompts and outputs are not stored but the compiled JSON schema is cached for up to 24 h since last use. Prompt caching is "Yes" (KV cache held in memory for the TTL). PDF input via Messages is eligible. **Message Batches are not eligible (29-day retention)**, and neither is the Files API. Under ZDR the API does not block ineligible features; using them steps outside ZDR for that data. Source: same page.
- **Covered Models** (Claude Fable 5.1, Mythos 5.1, Fable 5, Mythos 5) require 30-day retention and are not available under ZDR unless expressly authorized. Source: same page. These are also the most expensive tier and are not candidates for this workload.
- **Data residency: `inference_geo` supports only `"global"` (default) and `"us"`; workspace geo (storage at rest) supports only `"us"`. There is no EU inference or EU storage option on the first-party API.** US-only inference costs 1.1x. `inference_geo` is not applicable on Bedrock or Google-managed Vertex, where the endpoint region determines location. Source: [Claude docs, Data residency](https://platform.claude.com/docs/en/manage-claude/data-residency).
- Structured outputs/strict tool use are available on the first-party API, Bedrock, Vertex and Foundry (claude-api skill platform availability table, cached 2026-10).

Implication: the first-party Claude API can meet "no training" and, with ZDR, "no storage beyond processing" (with the flagged-content and schema-cache carve-outs). It **cannot** offer EU processing or EU storage. EU processing for Claude models therefore needs a cloud partner (see Bedrock and Vertex below), where the cloud provider is the processor.

### Microsoft Foundry / Azure OpenAI ("Foundry Models sold by Azure")

Verified facts:

- Prompts and completions are not available to OpenAI or other model providers. They are not used to train or improve models, and the models are stateless. Microsoft hosts the OpenAI models in Azure and does not call OpenAI-operated services. Source: https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy
- Processing location depends on the deployment type. Storage location does not: "Data stored at rest remains in the designated Azure geography" for all deployment types. **Global** types may process in any Azure region. **Data Zone** types process only within the data zone; the EU zone "follows the Azure EU Data Boundary, which can include ... EFTA countries ... such as Norway and Switzerland". **Standard / Regional Provisioned** types process within the chosen Azure geography. Microsoft can add regions to a data zone without prior notice. Source: https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/deployment-types
- `DataZoneStandard` (pay-per-token) is the managed path that keeps processing in the EU. `DataZoneBatch` also exists, at 50% off. `GlobalBatch` stores in the geography but may process anywhere. New models arrive Global first, then Data Zone, then geography-based, and geography-based types have "no guaranteed availability date". Not every model supports every type. Source: same deployment-types page.
- Features that store data (Responses API, stored completions, Assistants/threads, Files, batch input) keep it in the resource's geography until the customer deletes it. Source: data-privacy page.
- Abuse monitoring by default: classifiers run on prompts and completions. Flagged content may get automated review by AI models, and content reviewed that way is "not stored by the abuse monitoring system". Human review is a fallback when automated confidence is low. Content for human review is stored in the resource geography, and for EEA deployments the reviewers are in the EEA. Sources: https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/abuse-monitoring and the data-privacy page.
- **Modified abuse monitoring** is a Limited Access application. It needs "additional Limited Access eligibility criteria", and "some advanced models ... may have more stringent criteria". Once approved, Microsoft no longer stores prompts and completions or reviews them by humans, but automated classification continues. Approval can be checked through the resource capability `"ContentLogging": "false"`. Sources: the abuse-monitoring and data-privacy pages.
- The Microsoft Products and Services DPA governs. Source: data-privacy page (links aka.ms/DPA).

Unknowns:

- The public pages fetched do not state how long human-review samples are retained. Ask Microsoft or check the DPA and product terms.
- It is unknown whether a solo-operator company meets the modified-abuse-monitoring eligibility criteria. The criteria live on the Limited Access page and in an application form, and only the application gives a binding answer.
- Which current GPT models are offered as `DataZoneStandard` in EU regions must be checked per model on the "models sold directly by Azure" availability table at decision time, because the table changes often.

Implication: this is the most mature managed path that gives EU processing and EU storage for OpenAI-family models. It runs under a standard DPA without the vendor's sales-gated residency program. Without modified abuse monitoring, though, flagged content can be stored for human review, which collides with FA-UEB-12 "no storage beyond processing".

### Amazon Bedrock (Claude, OpenAI, Mistral, Amazon Nova and open-weight models, operated by AWS)

Verified facts:

- Model providers have no access to Bedrock's model deployment accounts, "they don't have access to Amazon Bedrock logs or to customer prompts and completions". Source: https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html
- **Retention is a self-service, per-Region setting.** `data_retention_mode: none` means "No request or response data is written to durable storage by AWS or shared with the model provider". It can be set at account level per Region, or per project on the `bedrock-mantle` endpoint, and enforced organisation-wide with an SCP condition key. If a model requires retention, requests to it fail under `none` with an error, so retention cannot be switched on silently. Each model declares `allowed_modes`. For example, Claude Opus 4.8 allows `none`, while Claude Fable 5/5.1 require `aws_review`, which means up to 30 days of retention and possible human review by AWS, not by Anthropic. Source: https://docs.aws.amazon.com/bedrock/latest/userguide/data-retention.html
- Model-specific abuse retention: for OpenAI models on Bedrock (except the gpt-oss family), "classifier-flagged traffic will be retained for up to 30 days", and eligible customers can request full ZDR through their AWS account team. For Claude Fable 5/5.1, all traffic is retained up to 30 days. With cross-region inference, retained data is stored in the Region where the request was processed. Separately, CSAM detection on image inputs and outputs may store and review flagged content. Source: https://docs.aws.amazon.com/bedrock/latest/userguide/abuse-detection.html
- ZDR for Claude models that otherwise require retention "is managed by Anthropic". Source: data-retention page.
- **EU processing for current Claude models comes through geographic cross-region inference.** Claude Haiku 5.5 and Claude Sonnet 5.5 have no In-Region option in any EU Region, only Geo (`eu.anthropic.claude-haiku-5-5`, `eu.anthropic.claude-sonnet-5-5`) or Global. Called from eu-central-1 (Frankfurt), the EU profile routes only to eu-central-1, eu-north-1, eu-south-1, eu-south-2, eu-west-1 and eu-west-3, all EU member states. Called from eu-west-2 (London) or eu-central-2 (Zurich), it also routes to that source Region. Geographic profiles' destination lists "will never change", whereas Global profiles can change. AWS says not to rely on the prefix and to verify destinations with `GetInferenceProfile` from each source Region. Sources: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-haiku-5-5.html , https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-sonnet-5-5.html , https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html
- Geographic profiles cost "standard pricing", and Global saves about 10%. CloudTrail records the actual `inferenceRegion` for each request, so EU processing can be audited. Source: https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html
- Haiku 5.5 and Sonnet 5.5 on Bedrock: 1M context, 128K max output, structured outputs supported. Sonnet 5.5 `tool_choice` accepts only `auto`/`none`, so use the JSON-schema output format instead of forced tools. Neither has a Batch tier listed. Bedrock bills Claude through AWS Marketplace, and Haiku 5.5 has tiered long-context pricing above 100K-token prompts. Sources: the two model cards above.
- Bedrock structured outputs: `output_config.format` (InvokeModel/Messages for Claude), `outputConfig.textFormat` (Converse) or `response_format` (open-weight models), plus `strict: true` tools. The schema subset is JSON Schema Draft 2020-12 without recursive schemas, numeric or string-length constraints, or `additionalProperties` other than `false`. Compiling a new schema "may take up to a few minutes". Compiled grammars are cached and encrypted for 24 hours, and identical schemas are reused per account. Structured outputs are incompatible with citations. Source: https://docs.aws.amazon.com/bedrock/latest/userguide/structured-output.html

Unknowns:

- The published Bedrock documentation does not list the effective `allowed_modes` for Claude Haiku 5.5 and Sonnet 5.5. The abuse-detection page names only Fable 5/5.1 among Anthropic models as requiring retention, which suggests the others permit `none`. Confirm by calling `GET /v1/models/{model}` once an account exists, which is a later ticket's job, not this one's.
- EUR prices for `eu.` profiles must be read from the Bedrock pricing page at decision time.
- Whether the compiled-grammar cache counts as "storage" of user data. It holds the schema, which is system data written by the operator, not user references.

Implication: Bedrock gives the clearest *self-service, enforceable* combination of EU-only processing (Geo EU profile from an EU-member source Region) and zero retention (`data_retention_mode: none`) for current Claude models, with no sales negotiation. The remaining exception is CSAM detection on image inputs. FA-ERF-12 allows 20 MB files and FA-ERF-07 (deferred) foresees OCR of scans, so this exception is avoided only if extraction sends extracted reference *text*, not PDF or image blocks. That is a design condition for #19, not something the requirements already guarantee.

### Google: Gemini Developer API and Vertex AI (Gemini, plus Claude as a partner model)

Verified facts, Gemini Developer API (ai.google.dev):

- Paid Services: prompts and responses are not used to improve products, and processing follows the processor data-processing addendum. Google logs prompts and responses "for a limited period of time" for abuse detection, policy enforcement and legal disclosure. The period is not stated. Data "may be stored transiently or cached in any country in which Google or its agents maintain facilities". An API client offered to users in the EEA, Switzerland or the UK may only use Paid Services. Source: https://ai.google.dev/gemini-api/terms
- So the Gemini Developer API has **no EU storage or processing guarantee** and an unspecified abuse-log retention period.
- Structured output: a JSON-schema `response_format` enforced by a "constrained decoding grammar engine", which yields syntactically valid JSON, though Google warns about "schema-compliant but semantically incorrect outputs". The supported subset includes `enum`, `minimum`/`maximum`, `prefixItems` and recursive `$ref`. `minLength`, `maxLength`, `uniqueItems` and some other keywords are silently stripped, so they must be validated in application code. Very large schemas can fail with `400 INVALID_ARGUMENT`. Source: https://ai.google.dev/gemini-api/docs/structured-output
- Developer-API list prices per 1M tokens (paid tier, prompts of 200K tokens or fewer): Gemini 2.5 Flash-Lite $0.10 in / $0.40 out, Gemini 3.1 Flash-Lite $0.25 / $1.50, Gemini 3.5 Flash-Lite $0.30 / $2.50, Gemini 3.6/3.8 Flash $0.75 / $3.75, Gemini 4 Argon $2 / $10. Batch is 50% cheaper. Increases are announced for several models after 30 Nov / 31 Dec 2026. Source: https://ai.google.dev/gemini-api/docs/pricing . Vertex AI prices can differ and must be checked separately.

Verified facts, Vertex AI:

- Google does not train on customer data without prior permission. This covers all managed models, including pre-GA ones. Source: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/vertex-ai-zero-data-retention
- **Caching is on by default and stores data.** In-memory caching for supported Gemini models is deleted within 24 hours. *Durable* caching, used when memory runs out, is "stored at rest" and also deleted within 24 hours. Both can be disabled per project with `cacheConfig.disableCache: true`. Request-response logging to BigQuery is off by default. The Interactions API defaults to `store = true` and needs `store = false`. Search grounding keeps derived query logs for 3 days, Maps grounding keeps data for 30 days, and neither can be disabled. Extraction does not need grounding, so this exception is avoidable. Source: same ZDR page.
- Abuse monitoring for Google models outside the "Frontier" and "Advanced AI" groups: only classifier-flagged *prompts* are logged, for up to 90 days, in the selected region or multi-region, with possible human review. Customers on online GCP terms are subject to this. Customers with a **Cloud Master Agreement are "exempt from prompt logging ... by default"**. "Advanced AI" partner models log all prompts and responses for 30 days. This covers Claude Mythos, Claude Fable and Claude Opus ≥4.7 / Sonnet ≥5 *when* `advanced_ai_enabled` is set for Anthropic's Cyber Verification Program. Claude Fable 5 and Mythos 5 require sharing with Anthropic. Source: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/abuse-monitoring
- Data residency: data at rest stays in the chosen location. ML processing follows the endpoint. The `eu` multi-region endpoint "strictly covers data residency within EU member states" and excludes the UK and Switzerland. The global endpoint gives no residency guarantee. Claude Haiku 5.5, Sonnet 5.5 and Opus 5.5 are listed in the partner-model residency table with EU multi-region, europe-west1 and europe-west4 columns. Which cell is supported for which model did not survive extraction and has to be read off the live table. Source: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/data-residency

Unknowns:

- The exact per-model EU availability for Gemini (EU multi-region, europe-west3/4/9) and Claude on Vertex. Read the live tables at decision time.
- Whether a solo operator can sign a Cloud Master Agreement. On online terms, flagged prompts are logged for up to 90 days with possible human review.
- The ZDR page does not cover partner-model (Claude) caching or retention on Vertex. Anthropic's terms for Vertex apply and must be checked there.

Implication: Vertex with the `eu` endpoint, caching disabled and no grounding can deliver EU-only processing for Gemini (and probably Claude). Unless a Cloud Master Agreement is in place, though, flagged prompts can be retained for up to 90 days with human review. The Gemini Developer API is not a fit for FA-UEB-13 because it has no location commitment.

### Mistral AI (direct API, La Plateforme)

Verified facts:

- **Training is opt-out, not opt-in.** Under the DPA, Mistral acts as an independent controller when it trains its models on customer data "unless Customer is or has opted-out of training" (DPA §2.3). The help center says pay-as-you-go customers "retain full control over this processing and have the right to opt out at any time", while Enterprise customers are opted out by default. The opt-out must therefore be set and documented actively. Sources: https://legal.mistral.ai/terms/data-processing-addendum , https://help.mistral.ai/en/articles/347617-do-you-store-the-data-i-send-you-via-the-api
- Mistral is also a controller for "automated moderation, including abuse monitoring on our APIs ... (except ... when zero data retention has been activated)" (DPA §2.3). Source: DPA above.
- **ZDR** is granted on request. The customer gives "sufficient detail of your legitimate reasons" and Mistral decides. It is available "only with pay-as-you-go and only for stateless API calls": chat completions, FIM, embeddings, moderations, classifications, OCR and audio. It does not apply to batch, files, conversations, agents or libraries. Source: https://help.mistral.ai/en/articles/347612-can-i-activate-zero-data-retention-zdr
- **Regional inference.** `api.eu.mistral.ai` "support[s] inference processing within the European Union" across "multiple data centers in EU and EFTA countries". The global `api.mistral.ai` endpoint makes no location commitment and is the default when no region is given. Regional inference "does not provide regional storage for all control-plane data". Only function calling is supported among tools, and Agents, Batch and Files are not available regionally. It costs 1.1× list price and is "separate from zero data retention". Source: https://docs.mistral.ai/studio/regional-inference
- Structured outputs: custom JSON Schema (also via Pydantic/Zod), described as "more reliable" than JSON mode. The fetched page documents neither constrained decoding nor a supported-keyword subset. Sources: https://docs.mistral.ai/capabilities/structured-output/custom_structured_output/ , https://docs.mistral.ai/studio/conversations/structured-output/custom
- Storage location: a help-center article (seen only as a search-result excerpt, because the page returned 404 when fetched) says data is hosted in the EU by default, that the US endpoint is opt-in, and that some features may transfer data temporarily outside the EU. Source: https://help.mistral.ai/en/articles/156206-when-using-mistral-ai-s-api-where-is-my-data-stored (unverified)
- List price: Mistral Large $0.50 input / $1.50 output per 1M tokens. The pricing page shows no prices for Small/Medium, and "Model training: Opt-out" in its plan table. Source: https://mistral.ai/pricing

Unknowns:

- The default API abuse-retention period. Secondary sources say 30 days, but no fetched primary page states it. Confirm from the DPA, the Trust Center or support.
- Whether a solo operator's "legitimate reasons" would be accepted for ZDR.
- Which models are served on `api.eu.mistral.ai`. Use `models.list` against the regional endpoint.
- Whether Mistral's structured outputs enforce the schema by constrained decoding or only by prompting. This matters for the CSL-JSON contract.
- The subprocessor list (trust.mistral.ai is rendered client-side and could not be read).

Implication: Mistral is an EU company with documented EU inference. Its EU endpoint may also use EFTA data centres, which matters for an "exclusively EU" reading of FA-UEB-14. Its defaults (training opt-out, abuse monitoring as controller) do not meet FA-UEB-12 until training is opted out and ZDR is granted, both of which require action from Mistral or the operator.

### EU-hosted managed open-weight model services

These services run open-weight models (Llama, Qwen, Gemma, gpt-oss, Mistral open models, DeepSeek, GLM) on their own European infrastructure.

**Scaleway Generative APIs (France):**

- "By default we apply a Zero Data Retention Policy." In misuse cases, meaning abnormal errors or possible malicious activity, Scaleway "may store temporarily and access the full content of HTTP requests" for "up to two weeks". Aggregated, anonymised usage data is kept up to 6 months. Data "is not used for training, retraining, or improving the base models". Personal data may be stored in Paris, France. Models are hosted on Scaleway infrastructure "without interaction with third-party services". Source: https://www.scaleway.com/en/docs/generative-apis/reference-content/data-privacy/
- Serverless models include Qwen3.5-397B-A17B, Qwen3-235B-A22B-Instruct-2507, DeepSeek-V4.1-Flash, GLM-5.3, gpt-oss-120b, Llama-3.3-70B, Mistral-Small-3.2-24B, Mistral-Medium-3.5 (preview) and Gemma-4-26B, with context windows of 100k–256k. Each is marked "Supports structured output: Yes". Source: https://www.scaleway.com/en/docs/generative-apis/reference-content/supported-models/
- Prices and the exact JSON-schema enforcement mechanism were not fetched.

**STACKIT AI Model Serving (Schwarz Group, region EU01):**

- "Your data and queries are neither stored nor used to train models." Chat models: Gemma 4 31B, gpt-oss-120b/20b, Llama 3.3 70B FP8, Qwen3-VL-235B-A22B FP8, Qwen3.6 27B and Qwen3.8 27B. Prices are per 1M tokens in EUR, for example gpt-oss-20b €0.15 / €0.25 and Qwen3-VL-235B €1.50 / €1.75. Source: https://stackit.com/en/products/data-ai/stackit-ai-model-serving
- The fetched page names only the region "EU01", not a country. Structured-output support is not documented on it.

**IONOS AI Model Hub (Germany):**

- "All inference is performed in ... data centers in Germany". Prompt and output content "is never logged" and "is not written to any log or to persistent storage". It is "not retained after the request completes" and "not used to train, fine-tune or otherwise improve any model". Only metadata is recorded (timestamp, model, token count). "No third-party sub-processors are engaged for AI Model Hub." Source: https://docs.ionos.com/cloud/ai/ai-model-hub/data-handling
- The API is OpenAI-compatible and tool calling is documented. JSON-schema structured output, the model list and prices were not verified. Source: https://docs.ionos.com/cloud/ai/ai-model-hub

Implication: these services are the strongest fit on paper for FA-UEB-12, FA-UEB-13 and the future FA-UEB-14. They give EU-only processing and storage, no training, and no or very narrow retention, with IONOS and STACKIT claiming no content storage at all. In exchange, only open-weight models are available, so extraction quality against FA-STR-02 and §14.4 is the unknown. Structured-output enforcement and the model catalogue also differ per provider and change often.

## Comparison

Status per path as documented publicly on 2026-10-24. "Contract" means the feature exists only after approval or negotiation.

| Path | Training on API data | Retention by default | Zero-retention path | Residual retention even then | EU processing | EU storage at rest | Structured output |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OpenAI direct | No (opt-in only) | Up to 30 days, abuse logs | ZDR/MAM, contract (sales) | CSAM hits on image/file inputs; prompt cache ≤24 h | Yes (EEA+CH), contract, +10 % on newer models | Yes, but the schema counts as system data and is not covered | JSON schema, strict |
| Anthropic direct | No | Up to 30 days (privacy center) | ZDR, contract (sales) | Flagged content ≤2 years, classifier scores ≤7 years; schema cache ≤24 h | **No** (global/US only) | **No** (US only) | JSON schema / strict tools |
| Azure (Foundry) | No | Abuse samples for human review, stored in the geography | Modified abuse monitoring, Limited Access application | Automated classification continues (no storage) | Yes, `DataZoneStandard` EU (may include EFTA) | Yes (geography) | JSON schema (per model) |
| Amazon Bedrock | No; providers have no access | Per model | `data_retention_mode: none`, **self-service**, enforceable via SCP | CSAM detection on images; Fable models cannot use `none` | Yes, `eu.` Geo profile from an EU-member source Region (EU member states only) | Yes (Region) | JSON schema subset (no recursion, no length/numeric constraints) |
| Vertex AI | No | Caches ≤24 h; flagged prompts ≤90 days (online terms) | Disable cache (self-service); prompt logging exempt by default only under a Cloud Master Agreement | Grounding logs (avoidable) | Yes, `eu` multi-region (EU member states only) | Yes | Gemini: schema subset incl. recursion; Claude: see Anthropic |
| Gemini Developer API | No (paid) | "Limited period", unspecified | None documented | n/a | **No** | **No** ("any country") | Same as Gemini on Vertex |
| Mistral direct | **Opt-out required** | Abuse monitoring as controller, period unverified | ZDR on request, pay-as-you-go only | Unknown | Yes, `api.eu` (EU + EFTA), +10 % | EU by default (unverified help-center excerpt), not all control-plane data | Custom JSON schema, enforcement not documented |
| Scaleway | No | None by default | Default | Misuse cases: full requests ≤2 weeks | Yes (FR) | Yes (Paris) | "Supported" per model |
| STACKIT | No | "Neither stored" | Default | None stated | Yes (EU01) | n/a | Not documented on fetched page |
| IONOS | No | Not logged, not retained | Default | Metadata only | Yes (DE) | n/a | Not verified |

### Cost assumption (to be replaced by measurement)

Illustrative workload: one check of **1,000 references** (the FA-ERF-12 maximum). Assume about 100 input tokens of reference text per reference plus a cacheable instruction/schema prefix, and about 250 output tokens of CSL-JSON per reference. That gives roughly 0.1M input and 0.25M output tokens per 1,000 references, so **output tokens dominate** the cost and a compact schema matters more than the prompt. At list prices this comes to about:

| Model / path | Price source | ≈ cost per 1,000 references |
| --- | --- | --- |
| Gemini 2.5 Flash-Lite (Developer API) | ai.google.dev pricing | $0.11 |
| Claude Haiku 5.5 (first-party list) | claude-api skill pricing cache | $0.14 |
| gpt-6-luna (+10 % EU residency) | developers.openai.com pricing | $0.15 |
| STACKIT gpt-oss-20b | stackit.com | €0.08 |
| Mistral Large (EU endpoint, +10 %) | mistral.ai/pricing, regional-inference page | $0.47 |
| STACKIT Qwen3-VL-235B | stackit.com | €0.59 |
| Gemini 3.6/3.8 Flash (Developer API) | ai.google.dev pricing | $1.01 |
| Claude Haiku 4.5 | claude-api skill pricing cache | $1.35 |
| Claude Sonnet 5.5 | claude-api skill pricing cache | $2.70 |
| gpt-6-sol (+10 % EU residency) | developers.openai.com pricing | $2.97 |

Even the most expensive candidate costs a few dollars per maximal check. Cost is unlikely to decide between providers. Quality, data-protection fit and latency will. Bedrock Geo profiles are documented at "standard pricing", and Vertex and Azure EU prices were not fetched. All of these must be read at decision time.

## Bibliographic extraction suitability

- None of the fetched sources publishes a benchmark for structuring bibliographic references into CSL-JSON, let alone per citation style. Suitability for FA-STR-02 (≥ 90 % per style) and §14.4 (≥ 93 % "Correct" on the AI path, ≤ 1 % false alarms) **cannot be derived from vendor documentation**. It has to be measured.
- Structured output guarantees *syntax*, not *correctness*. Google explicitly warns about "schema-compliant but semantically incorrect outputs" (https://ai.google.dev/gemini-api/docs/structured-output). Hallucinated or "normalised" fields are the main risk for FA-STR-08 and for the false-alarm target.
- CSL-JSON uses nested name arrays and `date-parts` arrays of arrays. Schema subsets differ: Bedrock rejects recursive schemas and length/numeric constraints, and Gemini silently drops `minLength`/`maxLength`. A **flat, non-recursive extraction schema** mapped to CSL-JSON in application code is portable across all paths and keeps FA-BTR-05 model switches cheap. All constraints should be re-validated in application code.
- Input context is rarely the constraint. The verified frontier candidates offer 1M tokens (Claude Haiku/Sonnet 5.5 on Bedrock), and most Scaleway serverless models offer 100k–256k. Some smaller open models are much shorter, though (e.g. Gemma-3-27B 40k, Holo2 22k on Scaleway), and OpenAI, Azure, Mistral, STACKIT and IONOS context windows were not verified. **Output length is the binding constraint.** At about 250 output tokens per reference, a 1,000-reference check needs about 250K output tokens, while Claude Haiku 5.5 and Sonnet 5.5 on Bedrock cap at 128K max output (model cards above). Chunking references across several requests is therefore **required**, not optional. Chunk size is also a lever for FA-UEB-42 latency.
- First-request schema compilation can take "up to a few minutes" on Bedrock (cached 24 h per account), so schema warm-up must be part of deployment, or the first check after a schema change breaks FA-UEB-42.

## Verified facts vs unknowns: what needs a contract or confirmation

Needs a contract, an approval or a written confirmation before the FA-UEB-12 acceptance criterion ("The contracts with the AI providers exclude training and storage") can be met:

1. **OpenAI**: ZDR or MAM approval (sales) plus EU data residency for the project. Confirm that the structured-output schema (system data) contains no user data, which holds if the schema is static.
2. **Anthropic first-party**: ZDR agreement (sales). Written position on the 2-year flagged-content retention and on the 30-day vs "not retained by default" wording.
3. **Azure**: modified-abuse-monitoring approval (Limited Access) for the operator's company. The retention period of human-review samples if not approved.
4. **Bedrock**: no approval is needed, because `none` is self-service. However, `data_retention_mode: none` is documented in the user guide as a *setting*, not as a contract term. Check whether the AWS Service Terms or the AWS DPA bind that setting contractually. If they do not, FA-UEB-12's acceptance criterion ("contracts ... exclude training and storage") needs clarification on whether configuration evidence (setting plus SCP) counts. Also confirm the `allowed_modes` of the chosen model and the effective EU destination Regions (`GetInferenceProfile`) once an account exists.
5. **Vertex**: whether a Cloud Master Agreement (prompt-logging exemption) is obtainable. Otherwise, flagged-prompt logging for up to 90 days remains. Also the retention terms for Claude as a partner model on Vertex.
6. **Mistral**: training opt-out (documented) plus ZDR approval. Confirm the abuse-retention period.
7. **Scaleway / STACKIT / IONOS**: DPA wording that matches the public "not stored" statements. For Scaleway, the 2-week misuse retention.
8. For every path: the DPA, the subprocessor list and the transfer mechanism, as input to the register of service providers (FA-UEB-13).

## What must be measured against the Reference test set before any model is chosen

- Per-style structuring accuracy (FA-STR-02, ≥ 90 % each style) and the §14.4 AI-path targets (≥ 93 % "Correct", ≤ 1 % false alarms, ≥ 98 % / ≥ 95 % detection), including books, chapters and web sources and German/English references.
- Field fidelity: the rate of fields added or changed relative to the original text, and whether the FA-STR-08 diff (AI output vs original text) can detect them.
- Recognition of "no references recognized" (FA-STR-06) on inputs without references.
- Schema-fit failures: refusals, truncated outputs and invalid or empty fields per model/path.
- Latency per chunk, end-to-end for 100 references (FA-UEB-42) and under 50 concurrent checks (FA-UEB-43), including cold schema compilation and EU-profile routing.
- Run-to-run stability. Several current Claude models reject `temperature`, so sampling cannot be pinned there (claude-api skill), and the same may apply elsewhere.
- Measured cost per 1,000 references with real token counts.
- The same suite reruns on every model change (FA-UEB-30, FA-BTR-05), so it should be automated and provider-neutral.

## Possible requirements change requests (nothing is relaxed here; flagged for the user)

- **FA-UEB-12** ("may not store them beyond processing", acceptance "contracts exclude ... storage"): no large provider fully waives safety retention. OpenAI keeps CSAM hits, Anthropic keeps flagged content for up to 2 years even under ZDR, Azure keeps flagged samples unless modified abuse monitoring is approved, Bedrock keeps CSAM detections on images, Vertex logs flagged prompts for up to 90 days without a Cloud Master Agreement, and Scaleway keeps misuse requests for up to 2 weeks. Bedrock with `none` plus text-only input (a design condition, see Bedrock), and IONOS/STACKIT per their public statements, come closest. For Bedrock it is also open whether a configuration setting satisfies an acceptance criterion phrased as "contracts". Either the requirement accepts a narrowly defined abuse/legal exception, or the choice is restricted to those paths.
- **FA-UEB-13 / FA-UEB-14**: FA-UEB-13 governs *storage* and allows non-EU providers with safeguards, so it does not by itself exclude the first-party Anthropic API or the Gemini Developer API. Those two have no EU processing path, though, so the deferred FA-UEB-14 option ("processing exclusively within the EU") could never be served by them. Azure's EU Data Zone and Mistral's EU endpoint may also use EFTA countries (e.g. CH/NO). If FA-UEB-14 means EU member states strictly, those paths need a clarification. Bedrock (from an EU-member source Region) and Vertex `eu` are documented as EU-member-states-only.
- **FA-STR-02 vs §14.4**: FA-STR-02 requires 11 styles at ≥ 90 % each "in the reference test set (14.4)". At market launch, §14.4 requires only five styles, and FA-UEB-32 grows this to ten. The acceptance criterion cannot be proven for all 11 styles with the launch test set. Either the test set must cover all 11 styles at launch, or FA-STR-02's acceptance must be scoped.

## Implications for later decision tickets

- **[AI provider and model (#19)](https://github.com/jeffnawroth/source-taster/issues/19)**: frontier candidates with a documented, self-service EU-plus-zero-retention path are Claude via Bedrock (`eu.` Geo profile, `data_retention_mode: none`) and Gemini via Vertex `eu` with caching disabled. The Vertex path needs a Cloud Master Agreement to drop prompt logging. Claude on Vertex is only a *possible* third option: its per-model EU availability is unverified, and the Vertex cache/ZDR page does not cover partner models. OpenAI direct (EU residency plus ZDR) and Azure (`DataZoneStandard` plus modified abuse monitoring) are viable but approval-gated. EU open-weight services (IONOS, STACKIT, Scaleway) are the data-protection-first fallback, or a second provider for FA-BTR-05, if they pass the measurements. Pin dated model versions and treat every change as a FA-UEB-30 release gate.
- **Error and fallback policy (#19)**: on Bedrock, an `allowed_modes` mismatch is a hard request error. Grammar compilation and cold starts, regional capacity and refusals all need a defined fallback, such as the parser path or another approved provider. Each fallback provider must itself meet FA-UEB-12/13 (FA-BTR-05).
- **BYOK extension point (FA-KON-20 / FA-STR-04, deferred)**: user keys for OpenAI, Anthropic or Google would typically hit the first-party APIs, without the operator's ZDR or EU settings. A BYOK path therefore needs its own FA-UEB-12/13 assessment and a disclosure. A provider-neutral adapter with a flat extraction schema keeps the hook open.
- **Hosting / EU-region decision**: co-locating the backend with the chosen AI region (e.g. AWS eu-central-1 or GCP europe-west3/4) reduces latency for FA-UEB-40–43. Picking Bedrock or Vertex couples the AI choice to the cloud choice.
- **Data processing and register of service providers (FA-UEB-13, FA-UEB-21, FA-UEB-22)**: every chosen AI path needs its DPA, subprocessor list, storage location, transfer mechanism and the documented retention exceptions above recorded in the register. The privacy policy has to disclose the abuse-monitoring exceptions.
