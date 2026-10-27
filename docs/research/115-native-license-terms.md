# #115 exact native license terms

Technical source-and-scope review on 2026-10-27. This supplies the primary-source
basis missing from the interrupted license pass. It does not approve legal texts,
publication, a private service, a new program/distribution boundary, or general
runtime MPL use. ADR-0002/0015/0020 and the publication gate still apply.

## What was checked

All **19 exact crate archives** listed below were downloaded afresh from the
publisher's immutable `static.crates.io` version URLs into the task-local
`.tmp/license-review/`, independently of the reused Cargo cache. Their SHA-256
values equal both the qualification policy and the selected graph checksums.
The archive contents were read directly without executing them. All **140 files**
pinned in `qualification/licenses/policy.json` match their fresh archive bytes:
normalized and original manifests, license texts, VCS records and the selected
MPL source files. All 19 archived `.cargo_vcs_info.json` records match the policy's
revision/path records. Every observed graph package source, checksum, declared
license, feature selection and graph membership matches the narrow policy.

Both original and normalized manifests declare the listed expression, with one
explicit nuance: `zlib-rs`'s original manifest uses `license.workspace = true`;
its normalized published manifest says `Zlib`, and the archive includes the
actual Zlib text. The original workspace indirection is retained, not replaced
by an invented original declaration. Hashes in this note identify archive bytes,
not a claim of authorship authentication beyond the registry/revision evidence.

The graph comparison used the preserved `.tmp/pagefind/graphs.json` (normal/build
closures for the named target/features), not a full workspace metadata superset.
The final implementation must regenerate current receipts and qualification
proof after its fingerprinted changes. A historical graph or this review note
cannot substitute for that current verification.

The exact per-file hashes, archive URLs, VCS revisions, permitted graphs, feature
arguments and obligations are recorded in
[`policy.json`](../../apps/website/qualification/licenses/policy.json). The
primary archives below contain the actual texts; none was inferred merely from
a license-name allowlist or a package database summary.

## Exact primary sources and observed scope

- **`const_format@0.2.35`** — declared `Zlib`; elected `Zlib`.
  [Immutable archive](https://static.crates.io/crates/const_format/const_format-0.2.35.crate); SHA-256
  `7faa7469a93a566e9ccc1c73fe783b4a65c274c5ace346038dca9c39fe0030ad`.
  Texts: `LICENSE-ZLIB.md`. Graphs: `native`.
  Archived VCS revision: `73dbf70b24acf6fe44cc588a0b712b2601bfb7ad`.
- **`const_format_proc_macros@0.2.34`** — declared `Zlib`; elected `Zlib`.
  [Immutable archive](https://static.crates.io/crates/const_format_proc_macros/const_format_proc_macros-0.2.34.crate); SHA-256
  `1d57c2eccfb16dbac1f4e61e206105db5820c9d26c3c472bc17c774259ef7744`.
  Texts: `LICENSE-ZLIB.md`. Graphs: `native`.
  Archived VCS revision: `11db5143f0008b0d6065f42d8a08f29e59fbab1e`.
- **`cssparser-color@0.5.0`** — declared `MPL-2.0`; elected `MPL-2.0`.
  [Immutable archive](https://static.crates.io/crates/cssparser-color/cssparser-color-0.5.0.crate); SHA-256
  `bbaa233e1dcd9c13a5d3e3a8a2c0f5a727bac380398345dbcb31db4597edc86b`.
  Texts: `LICENSE`. Graphs: `compiler`.
  Archived VCS revision: `4c49486494fb24dc01390e3baca9698ef1744c71`.
- **`cssparser-macros@0.6.1`** — declared `MPL-2.0`; elected `MPL-2.0`.
  [Immutable archive](https://static.crates.io/crates/cssparser-macros/cssparser-macros-0.6.1.crate); SHA-256
  `13b588ba4ac1a99f7f2964d24b3d896ddc6bf847ee3855dbd4366f058cfcd331`.
  Texts: `LICENSE`. Graphs: `native`.
  Archived VCS revision: `0ebd17bcd13808f087b083f34d2f816e380b5155`.
- **`cssparser-macros@0.7.0`** — declared `MPL-2.0`; elected `MPL-2.0`.
  [Immutable archive](https://static.crates.io/crates/cssparser-macros/cssparser-macros-0.7.0.crate); SHA-256
  `10a2a99df6e410a8ff4245aa2006499ea662245f967cc7c0a38c83ef8eb44dbf`.
  Texts: `LICENSE`. Graphs: `compiler`.
  Archived VCS revision: `4c49486494fb24dc01390e3baca9698ef1744c71`.
- **`cssparser@0.36.0`** — declared `MPL-2.0`; elected `MPL-2.0`.
  [Immutable archive](https://static.crates.io/crates/cssparser/cssparser-0.36.0.crate); SHA-256
  `dae61cf9c0abb83bd659dab65b7e4e38d8236824c85f0f804f173567bda257d2`.
  Texts: `LICENSE`. Graphs: `native`.
  Archived VCS revision: `9339ddd71443463dfb85d1185ad50cd98b34bc8f`.
- **`cssparser@0.37.0`** — declared `MPL-2.0`; elected `MPL-2.0`.
  [Immutable archive](https://static.crates.io/crates/cssparser/cssparser-0.37.0.crate); SHA-256
  `8c9cdaae01d5ed7882b04d795e7f752f46ff52d2fa3b50a20d28c464510bba98`.
  Texts: `LICENSE`. Graphs: `compiler`.
  Archived VCS revision: `4c49486494fb24dc01390e3baca9698ef1744c71`.
- **`dtoa-short@0.3.5`** — declared `MPL-2.0`; elected `MPL-2.0`.
  [Immutable archive](https://static.crates.io/crates/dtoa-short/dtoa-short-0.3.5.crate); SHA-256
  `cd1511a7b6a56299bd043a9c167a6d2bfb37bf84a6dfceaba651168adfb43c87`.
  Texts: `LICENSE`. Graphs: `native`, `compiler`.
  Archived VCS revision: `2d905cdb8b2e08163dc0d015f529877fe657b4ef`.
- **`foldhash@0.1.5`** — declared `Zlib`; elected `Zlib`.
  [Immutable archive](https://static.crates.io/crates/foldhash/foldhash-0.1.5.crate); SHA-256
  `d9c4f5dac5e15c24eb999c26181a6ca40b39fe946cbe4c263c7209467bc83af2`.
  Texts: `LICENSE`. Graphs: `rolldown`.
  Archived VCS revision: `42461756c3760f9165c90d9626a49e36980a1e47`.
- **`foldhash@0.2.0`** — declared `Zlib`; elected `Zlib`.
  [Immutable archive](https://static.crates.io/crates/foldhash/foldhash-0.2.0.crate); SHA-256
  `77ce24cb58228fbb8aa041425bb1050850ac19177686ea6e0f41a70416f56fdb`.
  Texts: `LICENSE`. Graphs: `native`, `rolldown`.
  Archived VCS revision: `8f878c636fda9c9e93384824ea45e06d03f009f5`.
- **`parcel_selectors@0.28.3`** — declared `MPL-2.0`; elected `MPL-2.0`.
  [Immutable archive](https://static.crates.io/crates/parcel_selectors/parcel_selectors-0.28.3.crate); SHA-256
  `d05f71e01edca03d245ab0a9f7ce13a974ceb79baaae8faf2ba0b11de6b90913`.
  Texts: `LICENSE`. Graphs: `compiler`.
  Archived VCS revision: `c6a0c3cebf3395635e61075d2c81a96a710d4910`.
- **`rolldown-notify@11.0.0`** — declared `CC0-1.0`; elected `CC0-1.0`.
  [Immutable archive](https://static.crates.io/crates/rolldown-notify/rolldown-notify-11.0.0.crate); SHA-256
  `43c65ad424b3737dcd3f32b96820fb77fea1a942fc6c7c54a788c68d7ace872e`.
  Texts: `LICENSE-CC0`. Graphs: `rolldown`.
  Archived VCS revision: `1f87947fd3ece9ba718e7ad82595a718a9041d25`.
- **`selectors@0.33.0`** — declared `MPL-2.0`; elected `MPL-2.0`.
  [Immutable archive](https://static.crates.io/crates/selectors/selectors-0.33.0.crate); SHA-256
  `feef350c36147532e1b79ea5c1f3791373e61cbd9a6a2615413b3807bb164fb7`.
  Texts: no standalone license file (see limitations below). Graphs: `native`.
  Archived VCS revision: `f319793c6989dba83994fbd10d560b21ad4a0c85`.
- **`static-self-derive@0.1.1`** — declared `MPL-2.0`; elected `MPL-2.0`.
  [Immutable archive](https://static.crates.io/crates/static-self-derive/static-self-derive-0.1.1.crate); SHA-256
  `5268c96d4b907c558a9a52d8492522d6c7b559651a5e1d8f2d551e461b9425d5`.
  Texts: no standalone license file (see limitations below). Graphs: `compiler`.
  Archived VCS revision: `0cc21e83b7fdf30045df1f8c7693d5e704e5c2c5`.
- **`static-self@0.1.2`** — declared `MPL-2.0`; elected `MPL-2.0`.
  [Immutable archive](https://static.crates.io/crates/static-self/static-self-0.1.2.crate); SHA-256
  `f6635404b73efc136af3a7956e53c53d4f34b2f16c95a15c438929add0f69412`.
  Texts: no standalone license file (see limitations below). Graphs: `compiler`.
  Archived VCS revision: `222fa9f7ad8b4004afd7a30c2f99cab3c8621191`.
- **`unicode-id-start@1.4.0`** — declared `(MIT OR Apache-2.0) AND Unicode-3.0`; elected `MIT AND Unicode-3.0`.
  [Immutable archive](https://static.crates.io/crates/unicode-id-start/unicode-id-start-1.4.0.crate); SHA-256
  `81b79ad29b5e19de4260020f8919b443b2ef0277d242ce532ec7b7a2cc8b6007`.
  Texts: `LICENSE-UNICODE`, `LICENSE-APACHE`, `LICENSE-MIT`. Graphs: `compiler`, `rolldown`, `satteri`.
  Archived VCS revision: `22af0cb339052b7567f0074645e20e0fa1624809`.
- **`unicode-ident@1.0.24`** — declared `(MIT OR Apache-2.0) AND Unicode-3.0`; elected `MIT AND Unicode-3.0`.
  [Immutable archive](https://static.crates.io/crates/unicode-ident/unicode-ident-1.0.24.crate); SHA-256
  `e6e4313cd5fcd3dad5cafa179702e2b244f760991f45397d14d4ebf38247da75`.
  Texts: `LICENSE-UNICODE`, `LICENSE-APACHE`, `LICENSE-MIT`. Graphs: `native`, `compiler`, `rolldown`, `satteri`, `web-de`, `web-en`, `web-unknown`.
  Archived VCS revision: `5b54a632702b5744a1c40ea01c127c0ac0498172`.
- **`xxhash-rust@0.8.19`** — declared `BSL-1.0`; elected `BSL-1.0`.
  [Immutable archive](https://static.crates.io/crates/xxhash-rust/xxhash-rust-0.8.19.crate); SHA-256
  `550a2b930b62486a393c52d5c3b84bff264b28aa437ed64694d31e93b1757af7`.
  Texts: `LICENSE`. Graphs: `rolldown`.
  Archived VCS revision: `3135fb1ea04369b84d19602bf6c14430224f8395`.
- **`zlib-rs@0.6.6`** — declared `Zlib`; elected `Zlib`.
  [Immutable archive](https://static.crates.io/crates/zlib-rs/zlib-rs-0.6.6.crate); SHA-256
  `b142a20ec14a91d5bc708c1dc21b080c550113d8aa77afa29635673a65dd02c5`.
  Texts: `LICENSE`. Graphs: `rolldown`.
  Archived VCS revision: `9909ff1b97ee1ec775e7337e8de63211afbd78aa`.

`native` is the minimal Pagefind indexing executable; `compiler` is Astro's
compiler-rs native binding; `rolldown` and `satteri` are native website build
tools. They execute while producing the static site and are not website reader
programs. The three `web-*` closures target `wasm32-unknown-unknown` and include
host build/proc-macro dependencies as well as target dependencies. In particular,
`unicode-ident`'s appearance there is a conservative notice/source inclusion;
a normal/build closure alone does not prove that all its code is linked into
WASM. No MPL entry appears in any of these three browser closures. Browser JS
bundle evidence separately restricts included modules to the pinned Pagefind
browser sources, including the existing fflate-derived gzip code.

The authorized host scope is exactly macOS arm64 and Linux amd64 GNU. Each host
requires its own rebuilt receipt; this review does not qualify another host or
foreign-platform publisher binary. Normal/build edges and exact feature
arguments remain mandatory. No test/dev/workspace-only inclusion is silently
accepted as execution evidence.

## Terms and concrete handling

### Zlib

The primary `LICENSE-ZLIB.md`/`LICENSE` files in the five listed Zlib archives
permit use for any purpose, including commercial use, and alteration and
redistribution, subject to three restrictions: do not misrepresent origin,
plainly mark altered source versions, and do not remove or alter the notice
from a source distribution. Attribution in product documentation is appreciated
but explicitly not required. The texts also disclaim warranty/liability.
`foldhash`'s notice names Orson Peters; the `const_format` notices name Matias
Rodriguez; `zlib-rs`'s notice names Trifecta Tech Foundation. Preserve those
actual notices, rather than substitute a generic Zlib heading.

The technical handling retains the complete, unchanged archives and full texts
in the build-tool source/notice package. This is compatible with producing the
selected website build without imposing Zlib terms on independent project files;
future modifications need a visible alteration notice and renewed qualification.

### MIT AND Unicode-3.0

Both original/normalized Unicode crate manifests declare
`(MIT OR Apache-2.0) AND Unicode-3.0`. Electing MIT resolves only the parenthesized
alternative: **`MIT AND Unicode-3.0`** remains mandatory. The actual
`LICENSE-MIT` requires the copyright/permission notice in copies or substantial
portions. The actual `LICENSE-UNICODE` is headed “UNICODE LICENSE V3”, names
Unicode, Inc. (1991–2023), and permits use/modification/distribution with its
copyright and permission notice either with copies or in associated
documentation. It preserves warranty/liability disclaimers and prohibits using
a copyright holder's name in advertising/promotion without written authorization.
Those are conditions to retain, not a reason to discard the Unicode conjunct.

Retain both complete elected texts and original sources. The source/notice
package also preserves the unelected Apache text. Pagefind browser delivery
includes the full Unicode and MIT notices for the exact selected `unicode-ident`
identity plus its vendored source/archive; removing the Unicode notice must
refuse qualification. Neither the election nor a host-only occurrence of
`unicode-id-start` permits a new browser/runtime use without renewed scope review.

### CC0-1.0

`rolldown-notify@11.0.0`'s original/normalized manifest declares `CC0-1.0`.
Its primary `LICENSE-CC0` contains the waiver, public-license fallback and
limitations of CC0 1.0 Universal. Section 4(a) explicitly does **not** waive or
grant trademark/patent rights; sections 4(b)–(d) preserve disclaimers and do not
clear third-party rights. The archive's text includes literal
`<<beginOptional;name=ccOptionalIntro>>`/`<<endOptional>>` formatting markers.
Retain that actual text unchanged, including the markers; do not present an
edited generic text as bytes from this archive. The technical policy recognizes
only this exact build-tool identity and preserves its source/text. It infers no
patent, trademark or broader legal clearance.

### Boost Software License 1.0

`xxhash-rust@0.8.19`'s `LICENSE` explicitly says “Boost Software License -
Version 1.0 - August 17th, 2003”. This is the permissive Boost license identified
as `BSL-1.0`, not a Business Source license. It permits use, reproduction,
distribution, execution and derivative works. It requires copyright notices and
the entire grant/restriction/disclaimer statement in copies and derivative works,
with an exception for copies solely in machine-executable object code generated
by a source-language processor. Preserve the full source text anyway in this
qualification's source/notice package. No additional runtime role is admitted.

### MPL-2.0 compiler and indexing tooling

The ten exact MPL entries above belong only to `native` and/or `compiler`.
The CSS parser, macros, color parser, dtoa-short and parcel_selectors archives
include full MPL texts and source notices where listed in the policy. The
primary [MPL 2.0 text from Mozilla](https://www.mozilla.org/MPL/2.0/) establishes:

- Sections 1.4/1.10 define covered software and covered modifications at the
  source-file level; using a build tool is not itself a secondary-license election.
- Section 3.1 requires covered source, including modifications, to remain under
  MPL and recipients to be told how to obtain that license; source rights cannot
  be restricted by an executable's terms.
- Section 3.2 requires covered source to be available to executable recipients
  by reasonable, timely means at no more than distribution cost, with information
  on how to obtain it. Supplying a binary alone does not discharge that duty.
- Section 3.3 permits a larger work under chosen terms while preserving MPL
  obligations for covered files. Its secondary-license mechanism is separate;
  **this qualification makes no secondary-license election** or claim that a
  manifest alone proves eligibility for one.
- Section 3.4 preserves the substance of copyright, license, patent and
  warranty/liability notices, subject to its factual-correction allowance.

Accordingly, preserve complete unchanged `.crate` sources with original
manifests/notices, a full MPL text and an explicit source-access notice for any
recipient of the covered native build executables. The technical implementation
retains these beside the build evidence in `.tmp/pagefind/license-sources/`, and
CI must retain that directory in its dependency artifact. The selected website
build tools may use those sources under MPL while independent project files
retain their licenses. This is a specific source/notice delivery strategy for
build-tool recipients, not blanket AGPL/MPL combination approval, browser MPL
acceptance, private/domain use, or satisfaction of market-launch legal review.
If a covered file or generated implementation is newly transferred into another
program/distribution, re-qualify its source obligations and boundary.

Three primary archives omit a standalone MPL license file:

- `selectors@0.33.0` declares MPL-2.0 in both manifests; its 16 pinned Rust files
  carry the MPL source-file notice directing readers to Mozilla's MPL 2.0 text.
- `static-self@0.1.2` and `static-self-derive@0.1.1` declare MPL-2.0 in both
  manifests. Their pinned Rust source files do not add per-file MPL headers.
  The evidence for their license grant is the publishers' immutable manifest
  declarations; do not claim that missing headers or license files were found.

Supply the full MPL separately for those archives, without altering their
publisher bytes or pretending that it came from an omitted upstream file.
The supplemental checked-in text has SHA-256
`fab3dd6bdab226f1c08630b1dd917e11fcb4ec5e1e020e2c16f83a0a13863e85`,
identical to the full text shipped by the cssparser archives. Mozilla's
[plain text](https://www.mozilla.org/media/MPL/2.0/index.txt), downloaded in this
review, has SHA-256
`3f3d9e0024b1921b067d6f7f88deb4a60cbe7a78e76c64e3f1d7fc3b779b9d04`.
The observed difference is trailing whitespace and `http` versus `https` in the
Exhibit A license link; the license terms match. The supplemental bytes are
pinned as supplied, not falsely reported as byte-identical to today's website.

## Refusal and remaining approvals

The additional technical recognition is limited to these identity/source/hash,
expression, target, graph and feature tuples. Unknown versions, wrong scope,
changed declarations, corrupt archives/texts or a dropped Unicode conjunct must
still fail closed. A general MPL expression receives no additional permission.
The only approved prereleases remain the exact get-tsconfig beta and the two
compiler Lightning CSS alphas recorded in ADR-0002/0020. Advisory inventories and
the raw source-lock ledger remain required; this note suppresses no advisory.

The build's passing technical gate cannot supply a human legal or publication
review. The Pagefind microjson GPL manifest/header distinction, actual GPL/AGPL
program boundaries and source offer, approved bilingual legal content,
translation/accessibility review, real domain/support/seller details and other
launch approvals remain separate. Corresponding Source and authentic notices
must remain downloadable; their existence alone is not legal approval.
