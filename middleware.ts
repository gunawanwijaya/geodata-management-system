import { type NextRequest, NextResponse } from 'next/server';
import { encryptAesGcm, decryptAesGcm, getKeyAesGcm } from "@/app/components/edge";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  // needCsrf
  const needAntiCsrf = await [
    "/signin",
    "/register",
  ].reduce(async (p, c) => {
    if (await p) { return p }
    const anticsrf = req.nextUrl.searchParams.get("anticsrf") ?? "";
    let toBeAdded = req.nextUrl.pathname.startsWith(c) && anticsrf.length < 1;
    if (anticsrf.length > 0) {
      const now = new Date();
      const exp = new Date(JSON.parse(await decryptAesGcm(await getKeyAesGcm(), anticsrf)) as Date);
      toBeAdded = exp.valueOf() <= now.valueOf();
    }
    return toBeAdded;
  }, Promise.resolve(false));
  if (needAntiCsrf) {
    const seconds = (ms: number): number => 1000 * ms;
    const minutes = (n: number): number => 60 * seconds(n);
    const exp = new Date(Date.now() + minutes(1.5));
    const enc = await encryptAesGcm(await getKeyAesGcm(), `${exp.valueOf()}`);
    const dec = await decryptAesGcm(await getKeyAesGcm(), enc);
    // console.info({ enc, dec });
    ; ((..._: [unknown]): void => { /* eslint-disable-line @typescript-eslint/no-unused-vars */ })(dec);
    req.nextUrl.searchParams.set("anticsrf", enc);
    return NextResponse.redirect(req.nextUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: '/:path*' }
