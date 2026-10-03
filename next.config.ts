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
  /**
   * `/_global-error` is the only page this app prerenders at build time, and Next 16 intermittently
   * fails it with `InvariantError: Expected workStore to be initialized`. The prerender's
   * AsyncLocalStorage scope has already unwound by the time metadata resolution reads the store, so
   * it is a race inside Next rather than anything this app does - the same build passes on a rerun.
   * Next exits the whole build on the first miss, so the export worker is given retries instead.
   * https://github.com/vercel/next.js/issues/98200
   */
  experimental: {
    staticGenerationRetryCount: 3,
  },
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
  async redirects() {
    return [
      {
        source: '/:sport/picks',
        destination: '/:sport/projections',
        permanent: true,
      },
      {
        source: '/blog/picks-2023-review',
        destination: '/blog/2023-projection-accuracy-review',
        permanent: true,
      },
    ];
  },
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



