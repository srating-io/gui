
export const dynamic = 'force-dynamic';

import { Metadata, ResolvingMetadata } from 'next';

import NavBar from '@/components/generic/Dashboard/NavBar';
import ReduxWrapper from '@/components/generic/Dashboard/ReduxWrapper';
import ContentsWrapper from '@/components/generic/Dashboard/ContentsWrapper';
import { Client } from '@/components/generic/Dashboard/Contents/ClientWrapper';
import DashboardLoader from '@/components/generic/Dashboard/DashboardLoader';


type Props = {
  params: Promise<object>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};


/**
 * Kept out of the index, unlike every other route here.
 *
 * There is no middleware and no route-level auth in this app, so this page renders its shell for
 * anyone who asks -- the data is what is withheld. A crawler following a link here would index an
 * empty admin console, which is noise at best and a signpost at worst.
 */
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: 'sRating | Dashboard',
    description: 'Administration',
    robots: {
      index: false,
      follow: false,
    },
  };
}

/**
 * Everything on this page is fetched client side by DashboardLoader, so each request carries the
 * user's session and the api can tell whether it is talking to an admin.
 *
 * It must stay that way. The server-side caller presents the master secret, which turns blacklist
 * enforcement off and skips the admin gate entirely -- anything fetched here instead would end up
 * in the server-rendered html, which is exactly what an unauthenticated visitor receives.
 */
export default async function Page({ searchParams }: Props) {
  const searchParameters = await searchParams;
  const view = searchParameters?.view || 'overview';

  return (
    <>
      <ReduxWrapper view = {view as string}>
        <NavBar />
        <ContentsWrapper>
          <Client />
        </ContentsWrapper>
        <DashboardLoader />
      </ReduxWrapper>
    </>
  );
}
