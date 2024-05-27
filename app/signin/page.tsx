'use client';
import type { FormEvent, ReactElement } from "react";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function SigninPage(): ReactElement {

  const router = useRouter();
  const qs = new URLSearchParams(location.search);
  const message = qs.get("message");

  useEffect(() => {
    if (message) { // eslint-disable-line @typescript-eslint/strict-boolean-expressions
      if (confirm(atob(message.replaceAll("-", "+").replaceAll("_", "/")))) {
        qs.delete("message");
        router.push(`${location.pathname}?${qs.toString()}`)
      }
    }
  }, []);

  function onSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    e.stopPropagation();
    const body = new FormData(e.currentTarget);
    (async (): Promise<void> => {
      const anticsrf = qs.get("anticsrf");
      if (anticsrf) body.set("anticsrf", anticsrf); // eslint-disable-line @typescript-eslint/strict-boolean-expressions

      interface Response {
        data: {
          signin: {
            user: { id: string; username: string }
            access: { token: string; expires: number }
          }
        }
      }
      const res = await fetch("/api/signin", { method: "POST", body }).then<Response>(async r => r.json());
      console.log(res);
    })().then(console.debug, console.error);
  }

  return (
    <main className="m-4 flex flex-col items-center justify-center">
      <form onSubmit={onSubmit} className="p-4 max-w-sm border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <label htmlFor="username" className="w-full mb-4">
          <span>Username</span>
          <input id="username" name="username" type="text" placeholder="Username" className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
        </label>
        <label htmlFor="password" className="w-full mb-6">
          <span>Password</span>
          <input id="password" name="password" type="password" placeholder="*******" className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
        </label>
        {/* <p className="text-red-500 text-xs italic">Please choose a password.</p> */}
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Sign In
        </button>
      </form>
    </main>
  )
}
