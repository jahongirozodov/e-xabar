import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PDF/Excel generatorlar — server'da tashqi paket (bundle qilinmasin).
  serverExternalPackages: ["@react-pdf/renderer", "exceljs"],
};

export default nextConfig;
