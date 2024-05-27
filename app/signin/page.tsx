'use client';
import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';

interface PageProps {
  searchParams?: Record<string, string[] | string | undefined>;
}

export default function SigninPage({ searchParams }: Readonly<PageProps>): ReactElement {

  const qs = useSearchParams();
  const router = useRouter();

  let message = "";
  let redir = "";
  let newToast = "";
  if (searchParams) {
    message = (searchParams.message ?? "") as string;
    redir = (searchParams.redir ?? "") as string;
    newToast = Buffer.from(message.replaceAll("-", "+").replaceAll("_", "/"), "base64").toString();
  } else {
    message = qs.get("message") ?? "";
    redir = qs.get("redir") ?? "";
    newToast = atob(message.replaceAll("-", "+").replaceAll("_", "/"));
  }

  const [toast] = useState(newToast);

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
      console.log({ res });
      if (redir.length > 0) { router.push(redir); return }
      router.push("/upload")
    })().then(console.debug, console.error);
  }

  return (
    <main className="m-4 flex flex-col items-center justify-center">

      <div id="toast-default" hidden={toast.length < 1} className={(toast.length < 1 && "hidden ") + " mb-4 flex items-center w-full max-w-sm p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"} role="alert">
        <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:bg-blue-800 dark:text-blue-200">
          <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.147 15.085a7.159 7.159 0 0 1-6.189 3.307A6.713 6.713 0 0 1 3.1 15.444c-2.679-4.513.287-8.737.888-9.548A4.373 4.373 0 0 0 5 1.608c1.287.953 6.445 3.218 5.537 10.5 1.5-1.122 2.706-3.01 2.853-6.14 1.433 1.049 3.993 5.395 1.757 9.117Z" />
          </svg>
          <span className="sr-only">Fire icon</span>
        </div>
        <div className="ms-3 text-sm font-normal">{toast}</div>
      </div>

      <form onSubmit={onSubmit} className="p-4 max-w-sm border-2 border-gray-300   rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">

        <h1 className="w-full mb-6 text-4xl font-semibold">✨ Sign in</h1>

        <label htmlFor="username" className="inline-block w-full">
          <span>Username</span>
          <input id="username" name="username" type="text" placeholder="Username" autoComplete="username" className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-200 dark:bg-gray-600 dark:border-gray-800" />
        </label>
        <label htmlFor="password" className="inline-block w-full">
          <span>Password</span>
          <input id="password" name="password" type="password" placeholder="*******" autoComplete="current-password" className="mb-16 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-200 dark:bg-gray-600 dark:border-gray-800" />
        </label>
        {/* <p className="text-red-500 text-xs italic">Please choose a password.</p> */}
        <a href="/register" style={{ float: "left" }} className="py-2 px-2 opacity-50 hover:opacity-80">
          Register instead
        </a>
        <button type="submit" style={{ float: "right" }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Sign In
        </button>
      </form>
    </main>
  )
}
