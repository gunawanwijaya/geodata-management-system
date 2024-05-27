/** @type {import('next').NextConfig} */
import { env, loadEnvFile } from "process";
switch (env.NODE_ENV) {
  case "test":
  case "production":
  case "development":
  default: env.NODE_ENV = "development";
}
loadEnvFile(`./.env.${env.NODE_ENV}.env`);
const nextConfig = {};

export default nextConfig;
