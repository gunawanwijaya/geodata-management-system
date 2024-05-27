import { env, loadEnvFile } from "process";
const scope = /^(production|test)$/ig.test(env.NODE_ENV)
  ? env.NODE_ENV.toLowerCase()
  : "development";
loadEnvFile(`./.env.${scope}`);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // serverRuntimeConfig: {},
  // publicRuntimeConfig: {},
};

export default nextConfig;
