'use client';

import ContentsWrapper, { PRICING_ID } from '@/components/generic/Home/ContentsWrapper';
import Footer from '../components/generic/Footer';

import Pricing from '@/components/generic/Pricing';
import Organization from '@/components/helpers/Organization';
import { useAppSelector } from '@/redux/hooks';
import Hero from '@/components/generic/Home/Contents/Hero';
import Tour from '@/components/generic/Home/Contents/Tour';
import Why from '@/components/generic/Home/Contents/Why';


export default function Home() {
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);

  // the sport segment the visitor is already browsing in, so every link on the page lands in it
  const path = Organization.getPath({ organizations, organization_id });

  return (
    <div>
      <ContentsWrapper>
        <main>
          <Hero path = {path} />
          <Tour path = {path} />
          <Why />
          <div id = {PRICING_ID} style = {{ padding: '10px 10px' }}>
            <Pricing view = {null} />
          </div>
        </main>
      </ContentsWrapper>
      <div style = {{ padding: '20px 0px 0px 0px' }}><Footer /></div>
    </div>
  );
}
