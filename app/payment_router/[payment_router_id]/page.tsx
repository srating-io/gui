'use server';

import { Metadata, ResolvingMetadata } from 'next';
import PaymentRouter, { getDecoratePaymentRouter } from '../../../Surface/PaymentRouter';


type Props = {
  params: Promise<{ payment_router_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};


export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parameters = await params;
  // const searchParameters = await searchParams;

  const { payment_router_id } = parameters;

  const Surface = new PaymentRouter({});

  return Surface.getMetaData({ payment_router_id });
}


export default async function Page({ params, searchParams }: Props) {
  const parameters = await params;
  // const searchParameters = await searchParams;
  const { payment_router_id } = parameters;

  // const division_id = searchParameters?.division_id;

  const Surface = new PaymentRouter({});

  const args: getDecoratePaymentRouter = {
    payment_router_id,
  };

  return Surface.getDecorate(args);
}
