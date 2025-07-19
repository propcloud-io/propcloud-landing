
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { trackWaitlistSignup } from '@/components/Analytics';

export function useWaitlist() {
  const [showThankYou, setShowThankYou] = useState(false);

  const handleWaitlistSuccess = () => {
    setShowThankYou(true);
    trackWaitlistSignup('success');
  };

  const closeThankYou = () => {
    setShowThankYou(false);
  };

  return {
    showThankYou,
    handleWaitlistSuccess,
    closeThankYou
  };
}
