import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/GlassLogo.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/GlassLogo.png"
        />
        {/* Preconnect and Google Fonts link */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com"  />
        <link
          href="https://fonts.googleapis.com/css2?family=Akaya+Kanadaka&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body>
        <Main  />
        <NextScript />
      </body>
    </Html>
  );
}
