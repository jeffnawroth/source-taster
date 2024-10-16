![](/extension/assets/icon128.png)

![MIT License](https://img.shields.io/badge/License-MIT-green.svg) ![GitHub Release](https://img.shields.io/github/v/release/jeffnawroth/source-taster) ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/jeffnawroth/source-taster/ci.yml)

# The Source Taster

The Source Taster is a browser extension that helps users, especially students and researchers, quickly and efficiently verify the validity and existence of sources cited in academic papers.

## Demo

<p align="center">
  <img src="https://github.com/user-attachments/assets/12341114-2c38-4762-97e0-46f745e2c52e">
</p>

## Features

- **📥 Context Menu Import**: Load bibliographies directly via the context menu.
- **🔍 Automatic Detection**: Automatically detect and load bibliographies from websites
- **📊 Report Generation**: Generate a report indicating which DOIs exist, which are not in the Crossref database, and which do not exist
- **📄 PDF Download**: Download the generated report as a PDF
- **🌐 Open Literature in New Tab**: Access found literature directly in a new tab
- **🌙 Dark/Light Mode**: Toggle between dark and light mode

## How it Works
The Source Taster functions by extracting DOIs from the text of academic papers. It then queries the [Crossref](https://www.crossref.org/) database to check the existence of these DOIs. If a DOI is not found in the database, the extension further investigates whether it can still be [resolved](https://dx.doi.org/).
<!-- ## API Reference

https://api.crossref.org/swagger-ui/index.html -->

## Acknowledgements

[WebExtension Vite Starter](https://github.com/antfu-collective/vitesse-webext) - A Vite powered WebExtension starter template

## Authors

- [@jeffnawroth](https://www.github.com/jeffnawroth)
- [@ErenC61](https://www.github.com/erenc61)

## License
[MIT](/LICENSE)
