![](/extension/assets/icon128.png)

![MIT License](https://img.shields.io/badge/License-MIT-green.svg) ![GitHub Release](https://img.shields.io/github/v/release/jeffnawroth/source-taster) ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/jeffnawroth/source-taster/ci.yml)

# The Source Taster

The Source Taster is a browser extension that helps users, especially students and researchers, quickly and efficiently verify the validity and existence of sources cited in academic papers.

## Demo

<p align="center">
  <img src="https://github.com/user-attachments/assets/900dd96c-7b5e-4bae-946f-59d15f8a80eb" >
</p>

## Features

- **📥 Context Menu Import**: Load bibliographies directly via the context menu into the extension
- **🔍 Automatic Detection**: Automatically detect and load DOIs from websites
- **📎 PDF Import**: Import PDF files directly into the extension and validate their DOIs
- **📊 Report Generation**: Generate a report indicating which DOIs exist, which are not in the Crossref database, and which do not exist
- **📄 Report Download**: Download the generated report as a PDF
- **🌐 Open Literature**: Open found literature directly in a new tab
- **🌙 Multiple Themes**: Toggle between dark, light and system mode
- **🗣️ Multiple Languages**: Supports both German and English languages
- **🖥️ Choose Display Mode**: Choose between side panel and popup as a window

## API Docker Image

- Build the production image with `docker build -f apps/api/Dockerfile -t source-taster-api .` from the repository root.
- Run the container with your own environment variables: `docker run --rm -p 8000:8000 --env-file ./apps/api/.env.example -v $(pwd)/.keystore:/app/.keystore source-taster-api` (adjust the env file/values before using in production).
- The container exposes port `8000` and persists encrypted user keys in `/app/.keystore` (mount a volume to keep them across restarts).
- Provide real API keys (OpenAI/Anthropic/Google, Semantic Scholar, etc.) via `--env` or an env file before deploying publicly.

## How it Works

The Source Taster functions by extracting DOIs from the text of academic papers. It then queries the [Crossref](https://www.crossref.org/) database to check the existence of these DOIs. If a DOI is not found in the database, the extension further investigates whether it can still be [resolved](https://dx.doi.org/).

> [!TIP]
> **For the most reliable verification of sources, it is recommended to manually copy and paste DOIs into the extension.** While the automatic import feature can quickly detect many DOIs, it does not guarantee that all DOIs will be correctly identified. Manually entering DOIs ensures that you have the most accurate results.

<!-- ## API Reference

https://api.crossref.org/swagger-ui/index.html -->

## Acknowledgements

[WebExtension Vite Starter](https://github.com/antfu-collective/vitesse-webext) - A Vite powered WebExtension starter template

## Disclaimer

> [!WARNING]
> **Disclaimer:** The Source Taster extension is a helpful tool for verifying the existence and validity of DOIs. While we strive to provide accurate results, the automated checks cannot guarantee complete accuracy. We recommend manually verifying all sources, especially for critical research. Do not solely rely on the results from this extension—conduct additional checks to ensure reliability.

## License

[MIT](/LICENSE)
