# Library import dependency

The BibTeX/BibLaTeX adapter uses unmodified **BiblioJSON 4.1.0**, selected by
ADR-0011, by Johannes Wilm and contributors. It is licensed under LGPL-3.0:
https://www.npmjs.com/package/bibliojson/v/4.1.0

The pinned package includes its source and license. The library is loaded as a
separate Node.js dependency and can be replaced by the recipient; it is not
bundled into clients or public transport contracts. Distributions of the server
must retain that package's notices, LGPL license and corresponding source, and
allow replacement of the library. No library source has been modified here.

The owned RIS adapter and the application-owned import port are project code
under AGPL-3.0-or-later. Transport schemas and generated clients retain their
AGPL-3.0-or-later OR MIT licensing.
