'use client';
import { GeoJSON } from "ol/format";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { useState } from "react";
// import { useCookies } from "react-cookie";
// import { useRouter } from 'next/navigation';

export default function UploadPage(): ReactElement {

  const [message, setMessage] = useState("Click to upload your GeoJSON files");
  const [inactive, setInactive] = useState(true);
  // const [cookies,] = useCookies(["accessToken"]);
  // const router = useRouter();
  const maxSize = 1 << 20; // default to 1<<20 or 1MiB

  // useEffect(() => {
  //   if (!cookies.accessToken || cookies.accessToken === "") { // eslint-disable-line @typescript-eslint/strict-boolean-expressions
  //     const href = `/signin?redir=/upload&message=${btoa("Please signin to provide accessToken for upload").replaceAll("+", "-").replaceAll("/", "_")}`;
  //     router.push(href);
  //   };
  // }, []);

  function onChange(e: ChangeEvent<HTMLInputElement>): void {
    const files: File[] = []; for (const f of e.target.files ?? []) { files.push(f) }
    (async (): Promise<void> => {
      let numOfFeatures = 0;
      let numOfFiles = 0;

      try {
        await Promise.all(files.map(async (f) => {
          if (f.size > maxSize) {
            return Promise.reject(new Error(`(${f.name}) with size (${f.size}) is larger than allowed (${maxSize})`));
          }
          const text = await f.text();
          let featuresLength = 0;
          try { featuresLength = new GeoJSON().readFeatures(text).length } catch {
            return Promise.reject(new Error(`(${f.name}) is not a valid geojson format`))
          }
          if (featuresLength < 1) {
            return Promise.reject(new Error(`(${f.name}) do not have a feature`));
          }
          numOfFeatures += featuresLength;
          numOfFiles += 1;
          return Promise.resolve();
        }));
        const sfNumOfFeatures = numOfFeatures < 2 ? "" : "s";
        const sfNumOfFiles = numOfFiles < 2 ? "" : "s";
        setInactive(false);
        setMessage(`valid ${numOfFiles} geojson file${sfNumOfFiles} with ${numOfFeatures} feature${sfNumOfFeatures}`);
      } catch (err) {
        setInactive(true);
        setMessage(JSON.stringify(err));
      }
    })().then(console.debug, console.error);
  };

  function onSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    e.stopPropagation();
    const body = new FormData(e.currentTarget);
    (async (): Promise<void> => {
      // let authorization: string | undefined = undefined;
      // // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      // if (!cookies.accessToken || cookies.accessToken === "") {
      //   const href = `/signin?redir=/upload&message=${btoa("Please signin to provide accessToken for upload").replaceAll("+", "-").replaceAll("/", "_")}`;
      //   router.push(href);
      //   return;
      // } else { authorization = `Bearer ${cookies.accessToken}` };
      // headers: { authorization }
      await fetch("/api/upload", { method: "POST", body }).then(async r => r.json()).then(console.debug, console.error);
    })().then(console.debug, console.error);
  }

  return (
    <main className="m-4">
      <form onSubmit={onSubmit} className="flex flex-wrap items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
        <label htmlFor="files" className="flex flex-col items-center justify-center w-full h-48 cursor-pointer">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
          </div>
          <input id="files" name="files" type="file" className="hidden" accept="*" multiple={true} onChange={onChange} /> {""}
        </label>
        <button hidden={inactive} disabled={inactive} type="submit" className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Upload
        </button>
      </form>
    </main>
  )
}
