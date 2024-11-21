import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface CookieConsentContextProps {
  cookiesAccepted: boolean | null;
  acceptCookies: () => void;
  rejectCookies: () => void;
  isReady: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextProps | undefined>(undefined);

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ cookiesAccepted, setCookiesAccepted ] = useState<boolean | null>(null);
  const [ isReady, setIsReady ] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem('quaiscanIo_cookiesAccepted');
    if (storedConsent === 'true') {
      setCookiesAccepted(true);
    } else if (storedConsent === 'false') {
      setCookiesAccepted(false);
    }
    setIsReady(true);
  }, []);

  const acceptCookies = useCallback(() => {
    localStorage.setItem('quaiscanIo_cookiesAccepted', 'true');
    setCookiesAccepted(true);
  }, []);

  const rejectCookies = useCallback(() => {
    localStorage.setItem('quaiscanIo_cookiesAccepted', 'false');
    setCookiesAccepted(false);
  }, []);

  return (
    <CookieConsentContext.Provider value={{ cookiesAccepted, acceptCookies, rejectCookies, isReady }}>
      { children }
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};
