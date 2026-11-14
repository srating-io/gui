'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, Style } from '@esmalley/ts-utils';

// hydration renders every class the server did, and without this each rule would be injected again
if (typeof document !== 'undefined') {
  document.querySelectorAll('style[data-ssr-css]').forEach((element) => {
    Style.markInjected((element.getAttribute('data-ssr-css') || '').split(' '));
  });
}

/**
 * Ships the rules `Style.getStyleClassName` generates during a server render with the html, so a
 * page is styled before the bundle arrives rather than after hydration. Next calls the callback on
 * every streamed chunk and the sheet hands back only what that chunk added. Rules are collected
 * from client components rendering under this registry, which is every caller today - a server
 * component runs in a separate bundle whose rules this cannot see.
 */
const StyleRegistry = ({ children }: { children: React.ReactNode }) => {
  const [sheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const flushed = sheet.flush();

    if (!flushed) {
      return null;
    }

    return (
      <style data-ssr-css = {flushed.classNames.join(' ')} dangerouslySetInnerHTML = {{ __html: flushed.css }} />
    );
  });

  return children;
};

export default StyleRegistry;
