"use server";

import fs from "fs";
import { GeoJSON } from "ol/format";
import { type NextRequest, NextResponse } from "next/server";
import { Xid } from "xid-ts";
import { PrismaClient, Prisma } from '@prisma/client';
import { cookies } from 'next/headers'
import { decryptAesGcm, getKeyAesGcm } from "./../../components/server";

interface Standard {
  errors?: unknown[]
  data?: object
};

interface AccessToken {
  sub: string,
  nbf: number,
  exp: number,
}

export async function POST(req: NextRequest): Promise<NextResponse<Standard>> {
  let encAccessToken = req.headers.get("authorization")?.replace("Bearer ", "") ?? cookies().get("accessToken")?.value;
  if (!encAccessToken) return NextResponse.json(
    { errors: [Error("invalid accessToken found in cookies")] } as Standard,
    { status: 400 } as ResponseInit
  );
  const accessToken = JSON.parse(await decryptAesGcm(await getKeyAesGcm(), encAccessToken)) as AccessToken;
  if (accessToken.nbf > Date.now() || accessToken.exp < Date.now()) return NextResponse.json(
    { errors: [Error("invalid accessToken found in cookies")] } as Standard,
    { status: 400 } as ResponseInit
  );
  const userXid = Xid.parse(accessToken.sub);
  if (userXid.isZero() || userXid.timestamp() < 1 || userXid.counter() < 1) return NextResponse.json(
    { errors: [Error("invalid accessToken found in cookies")] } as Standard,
    { status: 400 } as ResponseInit
  );

  const form = await req.formData();
  const files = form.getAll("files") as File[];
  let numOfFeatures = 0;
  let numOfFiles = 0;
  const upload: {
    message?: string;
    persist?: { id: string; geojson: object }[]
  } = {};

  try {
    const prisma = new PrismaClient();
    await Promise.all(files.map(async (f) => {
      const text = await f.text();
      let featuresLength = 0;
      try { featuresLength = new GeoJSON().readFeatures(text).length } catch {
        return Promise.reject(new Error(`(${f.name}) is not a valid geojson format`))
      }
      if (featuresLength < 1) return Promise.reject(new Error(`(${f.name}) do not have a feature`));
      numOfFeatures += featuresLength;
      numOfFiles += 1;
      const name = new Xid().toString();
      return Promise.resolve({ name, text });
    })).then(async (all) => {
      const tx = all.map(({ name, text }) => {
        const dir = "./public/data/geojson"
        const local = `${dir}/${name}.geojson`;
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(local, text);
        upload.persist = upload.persist ?? [];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        upload.persist.push({ id: name, geojson: JSON.parse(text) });

        return ({
          data: { id: Buffer.from(name), url: local, userId: Buffer.from(userXid.buffer) },
        });
      });
      await prisma.$transaction([
        prisma.file.createMany({ data: tx.map(x => x.data) })
      ], {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      });
    });

    const sfNumOfFeatures = numOfFeatures < 2 ? "" : "s";
    const sfNumOfFiles = numOfFiles < 2 ? "" : "s";
    upload.message = `valid ${numOfFiles} geojson file${sfNumOfFiles} with ${numOfFeatures} feature${sfNumOfFeatures}`;

    return NextResponse.json(
      { data: { upload } } as Standard,
      { status: 200 } as ResponseInit
    );
  } catch (err) {
    return NextResponse.json(
      { errors: [err] } as Standard,
      { status: 400 } as ResponseInit
    );
  }
};
