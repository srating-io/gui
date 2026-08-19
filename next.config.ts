import { execSync } from 'child_process';
import withBundleAnalyzer from '@next/bundle-analyzer';


const commitHash = execSync('git rev-parse --short HEAD')
  .toString()
  .trim();


const commitDate = execSync('git log -1 --format=%cd')
  .toString()
  .trim();

const bundleAnalyzer = withBundleAnalyzer({
  // enabled: process.env.ANALYZE === 'true',
  enabled: false,
});

// this is just for the github build to pass, since the configuration file is git ignored
// let config = {
//   host: 'localhost',
//   port: 5000,
//   http: 'http',
//   use_origin: false,
//   path: null,
//   api_key: null,
//   stripe_public_key: null,
// };

// try {
//   const { clientConfig } = await import('./clientConfig.js');
//   config = clientConfig;
// } catch (e) {
//   // dont care
// }


export default bundleAnalyzer({
  // experimental: {
  //   scrollRestoration: false,
  // },
  env: {
    COMMIT_HASH: commitHash,
    COMMIT_DATE: commitDate,
    // NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: config.stripe_public_key,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  devIndicators: false,
  // output: 'standalone',
  // transpilePackages: ['@esmalley/react-material-ui'],
  reactStrictMode: true,
  // webpack: (config /* options */) => {
  //   config.module.rules.push({
  //     test: /\.md$/,
  //     use: [
  //       {
  //         loader: 'html-loader',
  //       },
  //       {
  //         loader: 'markdown-loader',
  //       },
  //     ],
  //   });

  //   return config;
  // },
});



