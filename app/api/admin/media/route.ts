import { put } from "@vercel/blob";
import { AssetKind } from "@prisma/client";
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/db";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxUploadSize = 4.5 * 1024 * 1024;

type ImageDimensions = {
  width: number;
  height: number;
};

type UploadedFileLike = {
  name: string;
  size: number;
  type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isUploadedFileLike(value: unknown): value is UploadedFileLike {
  return Boolean(
    value &&
      typeof value === "object" &&
      "name" in value &&
      "size" in value &&
      "type" in value &&
      "arrayBuffer" in value &&
      typeof (value as UploadedFileLike).arrayBuffer === "function"
  );
}

function extensionForMimeType(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

function cleanName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function storeLocally(bytes: Uint8Array, file: UploadedFileLike) {
  const extension = extensionForMimeType(file.type);
  const baseName = cleanName(file.name) || "image";
  const datePath = new Date().toISOString().slice(0, 10);
  const relativeDir = path.join("uploads", "admin", datePath);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  const filename = `${crypto.randomUUID()}-${baseName}.${extension}`;

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(path.join(absoluteDir, filename), bytes);

  return {
    url: `/${relativeDir.replaceAll(path.sep, "/")}/${filename}`
  };
}

function readPngDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (
    bytes.length < 24 ||
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47
  ) {
    return null;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    width: view.getUint32(16),
    height: view.getUint32(20)
  };
}

function readGifDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 10 || bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46) {
    return null;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    width: view.getUint16(6, true),
    height: view.getUint16(8, true)
  };
}

function readJpegDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    offset += 2;

    if (marker === 0xd8 || marker === 0xd9) {
      continue;
    }

    const segmentLength = view.getUint16(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      return null;
    }

    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame && offset + 7 < bytes.length) {
      return {
        height: view.getUint16(offset + 3),
        width: view.getUint16(offset + 5)
      };
    }

    offset += segmentLength;
  }

  return null;
}

function readWebpDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (
    bytes.length < 30 ||
    String.fromCharCode(...bytes.slice(0, 4)) !== "RIFF" ||
    String.fromCharCode(...bytes.slice(8, 12)) !== "WEBP"
  ) {
    return null;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const format = String.fromCharCode(...bytes.slice(12, 16));

  if (format === "VP8X" && bytes.length >= 30) {
    return {
      width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16),
      height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16)
    };
  }

  if (format === "VP8 " && bytes.length >= 30) {
    return {
      width: view.getUint16(26, true) & 0x3fff,
      height: view.getUint16(28, true) & 0x3fff
    };
  }

  if (format === "VP8L" && bytes.length >= 25) {
    const bits = view.getUint32(21, true);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1
    };
  }

  return null;
}

function readImageDimensions(bytes: Uint8Array, type: string): ImageDimensions | null {
  switch (type) {
    case "image/jpeg":
      return readJpegDimensions(bytes);
    case "image/png":
      return readPngDimensions(bytes);
    case "image/webp":
      return readWebpDimensions(bytes);
    case "image/gif":
      return readGifDimensions(bytes);
    default:
      return null;
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin.response) {
    return admin.response;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const altValue = formData.get("alt");
  const alt = typeof altValue === "string" ? altValue.trim() : "";

  if (!isUploadedFileLike(file)) {
    return errorResponse("Выберите файл изображения.", 400);
  }

  if (!allowedImageTypes.has(file.type)) {
    return errorResponse("Поддерживаются только JPEG, PNG, WebP и GIF.", 400);
  }

  if (file.size > maxUploadSize) {
    return errorResponse("Файл слишком большой. Максимальный размер: 4.5 MB.", 400);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const dimensions = readImageDimensions(bytes, file.type);
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  try {
    const storedFile = token
      ? await put(
          `item-examples/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${cleanName(file.name) || "image"}.${extensionForMimeType(file.type)}`,
          file,
          {
            access: "public",
            contentType: file.type,
            token
          }
        )
      : await storeLocally(bytes, file);

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        url: storedFile.url,
        alt: alt || null,
        kind: AssetKind.IMAGE,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        uploadedById: admin.session.user.id
      },
      select: {
        id: true,
        url: true,
        alt: true,
        kind: true,
        width: true,
        height: true
      }
    });

    return NextResponse.json({ mediaAsset, storage: token ? "blob" : "local" });
  } catch (error) {
    console.error("Media upload failed", error);
    return errorResponse("Не удалось загрузить изображение. Проверьте настройки хранилища и повторите попытку.", 500);
  }
}
