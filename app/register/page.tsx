'use client';
import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnLangCommon from '@zxcvbn-ts/language-common'
import * as zxcvbnLangEn from '@zxcvbn-ts/language-en'

export default function RegisterPage(): ReactElement {

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const defaultHint = () => ({
    username: { className: "", text: [""] },
    password: { className: "", text: [""] },
    repassword: { className: "", text: [""] },
  });
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

      const anticsrf = new URLSearchParams(location.search).get("anticsrf");
      if (anticsrf) body.set("anticsrf", anticsrf); // eslint-disable-line @typescript-eslint/strict-boolean-expressions

      const passwordMinLength = 8;
      const className = "border-red-400 dark:border-red-500";
      if (/[^a-zA-Z0-9_-]+/.test(username)) {
        setHint({ ...defaultHint(), username: { className, text: [`Username should use alphanumeric, underscore and dash`] } });
        return;
      }
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
      console.info({ body: [...body.entries()] });

      interface Response {
        data: {
          register: {
            user: { id: string; username: string }
            access: { token: string; expires: number }
          }
        }
      }
      const res = await fetch("/api/register", { method: "POST", body }).then<Response>(async r => r.json());
      console.log(res);
    })().then(console.debug, console.error);
  }

  return (
    <main className="m-4 flex flex-col items-center justify-center">
      <form onSubmit={onSubmit} className="p-4 max-w-sm border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <label htmlFor="username" className="inline-block w-full mb-2">
          <span>Username</span>
          <input id="username" name="username" type="text" placeholder="Username" className={hint.username.className + " mb-2 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 dark:border-gray-600"} />
          {hint.username.text.length > 0 &&
            <ul className="my-2 text-xs text-red-500 italic">{hint.username.text.map(text =>
              <li key={btoa(text)} className="my-2 text-xs text-red-500 italic">{text}</li>)}
            </ul>}
        </label>
        <label htmlFor="password" className="inline-block w-full mb-2">
          <span>Password</span>
          <input id="password" name="password" type="password" placeholder="*******" className={hint.password.className + " mb-2 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 dark:border-gray-600"} />
          {hint.password.text.length > 0 &&
            <ul className="my-2 text-xs text-red-500 italic">{hint.password.text.map(text =>
              <li key={btoa(text)} className="my-2 text-xs text-red-500 italic">{text}</li>)}
            </ul>}
        </label>
        <label htmlFor="repassword" className="inline-block w-full mb-2">
          <span>Retype Password</span>
          <input id="repassword" name="repassword" type="password" placeholder="*******" className={hint.repassword.className + " mb-2 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 dark:border-gray-600"} />
          {hint.repassword.text.length > 0 &&
            <ul className="my-2 text-xs text-red-500 italic">{hint.repassword.text.map(text =>
              <li key={btoa(text)} className="my-2 text-xs text-red-500 italic">{text}</li>)}
            </ul>}
        </label>
        {/* <p className="text-red-500 text-xs italic">Please choose a password.</p> */}
        <button type="submit" className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Register
        </button>
      </form>
    </main>
  )
}
