'use server';

import Surface from '../Surface';
import { Textor } from '@esmalley/ts-utils';
import ReduxWrapper from '@/components/generic/Dictionary/ReduxWrapper';
import ContentsWrapper from '@/components/generic/Dictionary/ContentsWrapper';
import HeaderClientWrapper from '@/components/generic/Dictionary/Header/ClientWrapper';
import HeaderServer from '@/components/generic/Dictionary/Header/Server';
import NavBar from '@/components/generic/Dictionary/NavBar';
import { Suspense } from 'react';

// Content Views
import SearchClient from '@/components/generic/Dictionary/Contents/Search/Client';

export type getDecorateDictionary = {
  table?: string;
  table_id?: string;
};

/**
 * The rows are fetched client side by Dictionary/Loader so the request carries
 * the user's session; this only lays the page out.
 */
class Dictionary extends Surface {
  async getMetaData(
    { table, table_id }:
    { table?: string; table_id?: string },
  ) {
    const name = table ? Textor.toSentenceCase(table) : 'Dictionary';

    return {
      title: `sRating | ${name}`,
      description: `${name} dictionary`,
      openGraph: {
        title: `${name}`,
        description: `${name} dictionary`,
      },
      twitter: {
        card: 'summary',
        title: `${name}`,
        description: `${name} dictionary`,
      },
    };
  }

  async getDecorate(
    { table, table_id }:
    getDecorateDictionary,
  ) {
    const getContent = () => {
      if (table && table_id) {
        // return <RowDetailsClient table={table} table_id={table_id} />;
        return <div>todo</div>;
      }
      return <SearchClient table={table} />;
    };

    return (
      <ReduxWrapper table={table} table_id={table_id}>
         <HeaderClientWrapper>
           <Suspense fallback={<></>}>
             <HeaderServer table={table} table_id={table_id} />
           </Suspense>
         </HeaderClientWrapper>
         <NavBar />
         <ContentsWrapper>
           {getContent()}
         </ContentsWrapper>
      </ReduxWrapper>
    );
  }
}

export default Dictionary;
