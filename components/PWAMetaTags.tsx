import Head from 'next/head';

export const PWAMetaTags = () => (
  <Head>
    <meta name="application-name" content="ARIA Maya Dashboard" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Maya" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#6366f1" />

    <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#6366f1" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="ARIA Maya Dashboard" />
    <meta name="twitter:description" content="Track Maya's unique emergence with you" />
    <meta name="twitter:image" content="/icons/icon-512x512.png" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="ARIA Maya Dashboard" />
    <meta property="og:description" content="Your evolving AI companion" />
    <meta property="og:site_name" content="ARIA Maya" />
    <meta property="og:image" content="/icons/icon-512x512.png" />
  </Head>
);