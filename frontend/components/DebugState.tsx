'use client';

import React from 'react';
import { useApplicationStore } from '../store/useApplicationStore';

export const DebugState: React.FC = () => {
  const state = useApplicationStore();

  return (
    <pre
      style={{
        padding: '1rem',
        background: '#f3f4f6',
        borderRadius: '0.5rem',
        fontSize: '0.85rem',
        overflowX: 'auto',
      }}
    >
      {JSON.stringify(state, null, 2)}
    </pre>
  );
};

export default DebugState;

