// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawnSync } from "node:child_process";

const build =
  "node apps/server/scripts/extractor-image.ts > .tmp/document-image-id && " +
  "export SOURCE_TASTER_DOCUMENT_IMAGE=$(cat .tmp/document-image-id)";

export function dockerHasImage(image: string): boolean {
  return (
    spawnSync("docker", ["image", "inspect", image], { stdio: "ignore" })
      .status === 0
  );
}

/**
 * Why the document-upload suites cannot pass here, or undefined. The service
 * fails closed (HTTP 503, "document-unavailable") without a usable extractor
 * image, so those suites report a bare 503 unless this is explained.
 */
export function documentImageProblem(
  image: string | undefined,
  hasImage: (image: string) => boolean = dockerHasImage,
): string | undefined {
  if (!image)
    return (
      "SOURCE_TASTER_DOCUMENT_IMAGE is not set: PDF/DOCX upload fails closed with HTTP 503, " +
      "so the document-upload tests (documents*, document-never-stored, bibliography-selection) will fail. " +
      `Build the isolated extractor image once, from the repository root (needs Docker): ${build}`
    );
  if (!hasImage(image))
    return (
      `SOURCE_TASTER_DOCUMENT_IMAGE=${image} is not available to Docker (image missing or Docker not running): ` +
      "PDF/DOCX upload fails closed with HTTP 503 and the document-upload tests will fail. " +
      `Start Docker and rebuild from the repository root: ${build}`
    );
  return undefined;
}
