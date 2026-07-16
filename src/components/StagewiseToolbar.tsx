'use client';

import { useEffect } from 'react';

export function StagewiseToolbar() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@21st-extension/toolbar').then(({ initToolbar }) => {
        initToolbar({ plugins: [] });
      });
    }
  }, []);

  return null;
}

// made by arpan
