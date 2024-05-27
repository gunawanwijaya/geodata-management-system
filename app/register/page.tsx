'use client';
import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnLangCommon from '@zxcvbn-ts/language-common'
import * as zxcvbnLangEn from '@zxcvbn-ts/language-en'

interface PageProps {
  searchParams?: Record<string, string[] | string | undefined>;
}

export default function RegisterPage({ searchParams }: Readonly<PageProps>): ReactElement {

  const qs = useSearchParams();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const defaultHint = () => ({
    username: { className: "dark:border-gray-800", text: [""] },
    password: { className: "dark:border-gray-800", text: [""] },
    repassword: { className: "dark:border-gray-800", text: [""] },
  });
  let anticsrf = "";
  if (searchParams) {
    anticsrf = (searchParams.anticsrf ?? "") as string;
  } else {
    anticsrf = qs.get("anticsrf") ?? "";
  }

  const [hint, setHint] = useState(defaultHint());

  function onSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    e.stopPropagation();
    const body = new FormData(e.currentTarget);

    (async (): Promise<void> => {
      await Promise.resolve("");
      setHint(defaultHint());
      const username = body.get("username") as string;
      const password = body.get("password") as string;
      const repassword = body.get("repassword") as string;
      body.delete("repassword");

      if (anticsrf) body.set("anticsrf", anticsrf); // eslint-disable-line @typescript-eslint/strict-boolean-expressions

      const className = "border-red-400 dark:border-red-500";
      const usernameMinLength = 3;
      if (username.length < usernameMinLength) {
        setHint({ ...defaultHint(), username: { className, text: [`Username minimum length is ${usernameMinLength}`] } });
        return;
      }
      if (/[^a-zA-Z0-9_-]+/.test(username)) {
        setHint({ ...defaultHint(), username: { className, text: [`Username should use alphanumeric, underscore and dash`] } });
        return;
      }
      const passwordMinLength = 8;
      if (password.length < passwordMinLength) {
        setHint({ ...defaultHint(), password: { className, text: [`Password minimum length is ${passwordMinLength}`] } });
        return;
      }
      if (password !== repassword) {
        setHint({ ...defaultHint(), repassword: { className, text: ["Password mismatch, please retype"] } });
        return;
      }
      zxcvbnOptions.setOptions({
        translations: zxcvbnLangEn.translations,
        graphs: zxcvbnLangCommon.adjacencyGraphs,
        dictionary: {
          ...zxcvbnLangCommon.dictionary,
          ...zxcvbnLangEn.dictionary,
        },
      });
      const zr = zxcvbn(password, [username]);
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (zr.feedback.warning) {
        setHint({ ...defaultHint(), password: { className, text: [zr.feedback.warning, ...zr.feedback.suggestions] } });
        return;
      }
      setHint(defaultHint());
      // console.info({ body: [...body.entries()] });

      interface Response {
        data: {
          register: {
            user: { id: string; username: string }
            access: { token: string; expires: number }
          }
        }
      }
      const res = await fetch("/api/register", { method: "POST", body }).then<Response>(async r => r.json());
      router.push("/upload");
      console.log(res);
    })().then(console.debug, console.error);
  }

  return (
    <main className="m-4 flex flex-col items-center justify-center">
      <form onSubmit={onSubmit} className="p-4 max-w-sm border-2 border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">

        <h1 className="w-full mb-6 text-4xl font-semibold">✨ Register</h1>

        <label htmlFor="username" className="inline-block w-full">
          <span>Username</span>
          <input id="username" name="username" type="text" placeholder="Username" autoComplete="username" className={" mb-4 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-200 dark:bg-gray-600 " + hint.username.className} />
          {hint.username.text.join("").length > 0 &&
            <ul className="my-2 text-xs text-red-500 italic">{hint.username.text.map(text =>
              <li key={btoa(text)} className="my-2 text-xs text-red-500 italic">{text}</li>)}
            </ul>}
        </label>
        <label htmlFor="password" className="inline-block w-full">
          <span>Password</span>
          <input id="password" name="password" type="password" placeholder="*******" autoComplete="current-password" className={" mb-4 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-200 dark:bg-gray-600 " + hint.password.className} />
          {hint.password.text.join("").length > 0 &&
            <ul className="my-2 text-xs text-red-500 italic">{hint.password.text.map(text =>
              <li key={btoa(text)} className="my-2 text-xs text-red-500 italic">{text}</li>)}
            </ul>}
        </label>
        <label htmlFor="repassword" className="inline-block w-full">
          <span>Retype Password</span>
          <input id="repassword" name="repassword" type="password" placeholder="*******" autoComplete="current-password" className={" mb-16 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-200 dark:bg-gray-600 " + hint.repassword.className} />
          {hint.repassword.text.join("").length > 0 &&
            <ul className="my-2 text-xs text-red-500 italic">{hint.repassword.text.map(text =>
              <li key={btoa(text)} className="my-2 text-xs text-red-500 italic">{text}</li>)}
            </ul>}
        </label>
        <a href="/signin" style={{ float: "left" }} className="py-2 px-2 opacity-50 hover:opacity-80">
          Sign in instead
        </a>
        <button type="submit" style={{ float: "right" }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Register
        </button>
      </form>
    </main>
  )
}
