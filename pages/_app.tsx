import { AppProps } from "next/app"
import Layout from "./components/Layout"
import "../styles/global.css"
import Head from "next/head"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>goldilocks v0.2</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}

export default MyApp