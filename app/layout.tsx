export const dynamic = 'force-dynamic';

import '../styles/global.css';
import 'typeface-roboto';

import React from 'react';
import Script from 'next/script';

import StoreProvider from './StoreProvider';
import SessionHandler from '@/components/handlers/SessionHandler';
import FavoriteHandler from '@/components/handlers/FavoriteHandler';
import KryptosClient from '@/components/handlers/kryptos/Client';
// import KryptosServer from '@/components/handlers/kryptos/Server';
import DictionaryWrapper from '@/components/handlers/dictionary/ClientWrapper';
import DictionaryHandler from '@/components/handlers/dictionary/Server';
import LayoutWrapper from './LayoutWrapper';
import MutationHandler from '@/components/handlers/MutationHandler';
// import Style from '@/components/utils/Style';
import NewUpdateHandler from '@/components/handlers/NewUpdateHandler';
import { useServerAPI } from '@/components/serverAPI';



export default async function RootLayout({ children }: {children: React.ReactNode}) {
  // const css = Style.getCSS(); // <-- Collect styles generated during SSR
  // Style.flush(); // <-- Clear cache for next request (important for SSR)

  // todo this doesnt work for SSR yet... this rootlayout does not retrigger when a server component is streamed after the fact. need to do some sort of context hook thingy to stream the new css
  // https://chatgpt.com/c/68367c38-f454-8002-a7dc-c16a706a3126

  const kryptos = await useServerAPI({
    class: 'secret',
    function: 'kryptos',
    arguments: {},
  });

  const secret = await useServerAPI({
    class: 'secret',
    function: 'find',
    arguments: {},
  });



  return (
    <html lang="en">
      {/* <head>
        <style srating-ssr-css = "true" dangerouslySetInnerHTML={{ __html: css }}></style>
      </head> */}
      <StoreProvider>
        <LayoutWrapper>
          <div id = 'menu-root'></div>
          <NewUpdateHandler />
          <KryptosClient kryptos = {kryptos} secret = {secret} />
          <MutationHandler />
          <SessionHandler />
          <FavoriteHandler />
          <DictionaryWrapper><DictionaryHandler /></DictionaryWrapper>
          {children}
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-S67JFT2KZW" strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-S67JFT2KZW');
              gtag('config', 'AW-11331182972');
            `}
          </Script>
          <Script id="twitter-landing" strategy="afterInteractive">
            {`
              !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('config','qltj2');
            `}
          </Script>
        </LayoutWrapper>
      </StoreProvider>
    </html>
  );
}

