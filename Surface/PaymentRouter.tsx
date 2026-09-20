'use server';

import { useServerAPI } from '@/components/serverAPI';
import { notFound } from 'next/navigation';
import Footer from '@/components/generic/Footer';
import ContentsWrapper from '@/components/generic/PaymentRouter/ContentsWrapper';
import ReduxWrapper from '@/components/generic/PaymentRouter/ReduxWrapper';
import ClientWrapper from '@/components/generic/PaymentRouter/Contents/ClientWrapper';
import Surface from '../Surface';
import { Payments } from '@srating-io/types';


export type getDecoratePaymentRouter = {
  payment_router_id: string;
};

class PaymentRouter extends Surface {
  // constructor() {
  //   super();
  // }


  async getMetaData(
    { payment_router_id }:
    { payment_router_id: string; },
  ) {
    // const { payment_router } = await this.getData({ payment_router_id });

    return {
      title: 'sRating | Billing',
      description: 'Billing information',
      openGraph: {
        title: 'sRating.io billing',
        description: 'Billing information',
      },
      twitter: {
        card: 'summary',
        title: 'Billing information',
      },
    };
  }

  async getData({ payment_router_id }) {
    // const revalidateSeconds = 12 * 60 * 60; // 12 hours

    const payment_router: Payments.PaymentRouter = await useServerAPI({
      class: 'payment_router',
      function: 'get',
      arguments: {
        payment_router_id,
      },
    });

    return { payment_router };
  }


  async getDecorate(
    { payment_router_id }:
    getDecoratePaymentRouter,
  ) {
    const data = await this.getData({ payment_router_id });
    const { payment_router } = data;

    if (!payment_router || !payment_router.payment_router_id) {
      return notFound();
    }


    return (
      <ReduxWrapper payment_router={payment_router}>
        <ContentsWrapper>
          <>
            <ClientWrapper />
            <div style = {{ padding: '20px 0px 0px 0px' }}><Footer /></div>
          </>
        </ContentsWrapper>
      </ReduxWrapper>
    );
  }
}

export default PaymentRouter;
