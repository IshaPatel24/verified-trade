import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#185FA5" />
        <meta name="description" content="VerifiedTrade - Trusted marketplace with instant compliant settlements powered by Cleanverse" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
