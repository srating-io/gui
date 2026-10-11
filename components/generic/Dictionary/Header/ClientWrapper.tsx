'use client';

import BackButton from '@/components/generic/BackButton';
import { useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import React from 'react';

const getBreakPoint = () => {
  return 450;
};

const getHeaderHeight = () => {
  return 50;
};

const getMarginTop = () => {
  const { width } = useWindowDimensions();

  let margin = 64;
  if (width < 600) {
    margin = 56;
  }
  return margin;
};

export { getBreakPoint, getHeaderHeight, getMarginTop };

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  const titleStyle: React.CSSProperties = {
    paddingTop: 5,
    height: getHeaderHeight(),
    position: 'sticky',
    top: getMarginTop(),
    backgroundColor: theme.background.main,
    zIndex: 1100,
  };

  return (
    <div style={titleStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: 36 }}>
          <BackButton />
        </div>
        {children}
        <div style={{ display: 'flex', justifyContent: 'end', position: 'relative', alignItems: 'center', width: 36 }}>
          <div style={{ width: 36 }}></div>
        </div>
      </div>
    </div>
  );
};

export default ClientWrapper;
