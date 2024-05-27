"use server";

import fs from "fs";
import { GeoJSON } from "ol/format";
import { type NextRequest, NextResponse } from "next/server";
import { Xid } from "xid-ts";
import { cookies } from 'next/headers'

interface Standard {
  errors?: Error[]
  data?: object
};

export async function POST(req: NextRequest): Promise<NextResponse<Standard>> {
  console.debug([
    cookies().get("accessToken")?.value,
    req.headers.get("authorization")?.replace("Bearer ", ""),
  ]);
  if (0 < Date.now()) return NextResponse.json(
    { errors: [ Error("invali") ] } as Standard,
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
    })).then((each) => each.map(({ name, text }) => {
      const dir = "./public/data/geojson"
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(`${dir}/${name}.geojson`, text);
      upload.persist = upload.persist ?? [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      upload.persist.push({ id: name, geojson: JSON.parse(text) });
    }));

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
