"use server";

import argon2 from "argon2";
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { Xid } from "xid-ts";
import { encryptAesGcm, decryptAesGcm, getKeyAesGcm } from "./../../components/server";
import { cookies } from 'next/headers'

interface Standard {
  errors?: unknown[]
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

    const passwordHash = await argon2.hash(password, opts);
    const user = await prisma.user.create({
      select: { id: true, username: true, passwordHash: false, files: false, _count: false },
      data: { id: Buffer.from(new Xid().buffer), username, passwordHash },
    });

    const id = Xid.fromValue(user.id).toString();
    const register = {
      user: { ...user, id },
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
      register.access.token = await encryptAesGcm(await getKeyAesGcm(), payload);
      register.access.expires = exp;
      cookies().set(
        "accessToken",
        register.access.token,
        { httpOnly: true, expires: exp },
      )
    }

    return NextResponse.json(
      { data: { register } } as Standard,
      { status: 200 } as ResponseInit
    );
  } catch (error) {
    return NextResponse.json(
      { errors: [error] } as Standard,
      { status: 400 } as ResponseInit
    );
  }
}
