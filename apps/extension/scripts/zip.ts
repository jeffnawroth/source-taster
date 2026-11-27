// SPDX-License-Identifier: AGPL-3.0-or-later
// A deterministic zip writer for store packages: no dependency, entries in
// byte order, one fixed timestamp, no extra fields and no file modes, so the
// same files always give the same bytes. Zip64, encryption and directory
// entries are deliberately absent; a package is far below the 4 GiB limit.
import { crc32, deflateRawSync } from "node:zlib";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface ZipFile {
  /** Forward slashes, no leading slash. */
  name: string;
  data: Buffer;
}

/** 1980-01-01 00:00:00, the zip epoch. */
const dosDate = (1 << 5) | 1;
const dosTime = 0;

export function zip(files: ZipFile[]): Buffer {
  const ordered = [...files].sort((a, b) =>
    Buffer.compare(Buffer.from(a.name), Buffer.from(b.name)),
  );
  for (let i = 1; i < ordered.length; i++)
    if (ordered[i]!.name === ordered[i - 1]!.name)
      throw new Error(`Duplicate zip entry ${ordered[i]!.name}`);
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const { name, data } of ordered) {
    if (name.startsWith("/") || name.includes("\\") || name.includes(".."))
      throw new Error(`Unsafe zip entry name ${name}`);
    const raw = Buffer.from(name, "utf8");
    const deflated = deflateRawSync(data, { level: 9 });
    const stored = deflated.length >= data.length;
    const body = stored ? data : deflated;
    const crc = crc32(data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4); // version needed
    header.writeUInt16LE(0x0800, 6); // UTF-8 names
    header.writeUInt16LE(stored ? 0 : 8, 8);
    header.writeUInt16LE(dosTime, 10);
    header.writeUInt16LE(dosDate, 12);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(body.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(raw.length, 26);
    header.writeUInt16LE(0, 28);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4); // made by: MS-DOS, 2.0
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(stored ? 0 : 8, 10);
    entry.writeUInt16LE(dosTime, 12);
    entry.writeUInt16LE(dosDate, 14);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(body.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(raw.length, 28);
    entry.writeUInt32LE(offset, 42);
    local.push(header, raw, body);
    central.push(entry, raw);
    offset += header.length + raw.length + body.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(ordered.length, 8);
  end.writeUInt16LE(ordered.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

/** Every file below `directory`, with forward-slash relative names. */
export function filesOf(directory: string): ZipFile[] {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const path = join(entry.parentPath, entry.name);
      return {
        name: path
          .slice(directory.length + 1)
          .split("\\")
          .join("/"),
        data: readFileSync(path),
      };
    });
}
