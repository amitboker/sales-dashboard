import { useEffect } from 'react';
import { useAuth } from './auth';
import { trackEvent } from './tracking';

export function usePageTracking(pageName, feature) {
  const { user } = useAuth();

  useEffect(() => {
    trackEvent('page_view', {
      page: pageName,
      feature: feature || undefined,
      userId: user?.id || undefined,
    });
  }, [pageName]);
}
