'use client';

import { useEffect } from 'react';

export function StagewiseToolbar() {
  useEffect(() => {
    // Only initialize in development mode
    if (process.env.NODE_ENV === 'development') {
      import('@21st-extension/toolbar').then(({ initToolbar }) => {
        initToolbar({ plugins: [] });
      });
    }
  }, []);

  return null;
}
