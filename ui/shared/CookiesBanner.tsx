import React from 'react';

import { useCookieConsent } from './CookieConsentContext';

const CookieBanner = () => {
  const { cookiesAccepted, acceptCookies, rejectCookies, isReady } = useCookieConsent();

  if (!isReady || cookiesAccepted !== null) {
    return null; // Don't render the banner if consent is already handled
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #ddd',
        zIndex: 2000,
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                By clicking “Accept All Cookies,” you agree to the storing of cookies on your device to enhance site
                navigation, analyze site usage, and assist in our marketing efforts.
      </p>
      <div>
        <button
          onClick={ rejectCookies }
          style={{
            backgroundColor: '#e53935', // Red for reject
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            marginRight: '10px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
                    Reject All
        </button>
        <button
          onClick={ acceptCookies }
          style={{
            backgroundColor: '#e53935', // Red for accept
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
                    Accept All Cookies
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
