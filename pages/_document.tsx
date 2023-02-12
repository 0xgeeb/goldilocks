import Document, { Html, Head, Main, NextScript } from "next/document"

function MyDocument() {
  return (
    <Html>
      <Head>
      <link href="https://fonts.googleapis.com/css2?family=Acme&family=Libre+Bodoni&display=swap" rel="stylesheet"/>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default MyDocument