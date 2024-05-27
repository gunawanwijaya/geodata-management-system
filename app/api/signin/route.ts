"use server";

import argon2 from "argon2";
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { Xid } from "xid-ts";
import { encryptAesGcm, decryptAesGcm, getKeyAesGcm } from "./../../components/server";
import { cookies } from 'next/headers'

interface Standard {
  errors?: string[]
  data?: object
}

interface AccessToken {
  sub: string,
  nbf: number,
  exp: number,
}

export async function POST(req: NextRequest): Promise<NextResponse<Standard>> {
  try {
    const form = await req.formData();
    const username = form.get("username") as string;
    const password = form.get("password") as string;
    const anticsrf = form.get("anticsrf") as string; // anticsrf injected to the client via redirect on query params

    const now = new Date();
    const eol = new Date(parseInt(await decryptAesGcm(await getKeyAesGcm(), anticsrf)));
    const expired = eol.valueOf() <= now.valueOf();

    // this is the first CSRF validation
    if (expired) { throw new Error("Invalid anticsrf"); }

    // this is the second CSRF validation against our persisting data source
    ; ((): void => { /* TODO: check csrf from db or redis */ })()

    const prisma = new PrismaClient();
    const opts: argon2.Options = {};

    const user = await prisma.user.findUniqueOrThrow({
      select: { id: true, username: true, passwordHash: true, files: false, _count: false },
      where: { username },
    });
    const ok = await argon2.verify(user.passwordHash, password, opts);
    if (!ok) { throw Error("invalid username or password") }

    const id = Xid.fromValue(user.id).toString();
    const signin = {
      user: { ...user, id, passwordHash: undefined },
      access: { token: "", expires: 0 },
    };

    {
      const seconds = (ms: number): number => 1000 * ms;
      const minutes = (n: number): number => 60 * seconds(n);
      const hours = (n: number): number => 60 * minutes(n);
      const nbf = new Date().valueOf();
      const exp = nbf + hours(1.5);

      const accessToken: AccessToken = {
        sub: id,
        nbf,
        exp,
      }

      const payload = JSON.stringify(accessToken);
      signin.access.token = await encryptAesGcm(await getKeyAesGcm(), payload)
      signin.access.expires = exp;
      cookies().set(
        "accessToken",
        signin.access.token,
        { httpOnly: true, expires: exp },
      )
    }

    return NextResponse.json(
      { data: { signin } } as Standard,
      { status: 200 } as ResponseInit
    );
  } catch (error) {
    return NextResponse.json(
      { errors: [error] } as Standard,
      { status: 400 } as ResponseInit
    );
  }
}
