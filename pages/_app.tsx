import { AppProps } from "next/app"
import Layout from "./components/Layout"
import Head from "next/head"
import { WagmiProvider } from "../providers/WagmiProvider"
import "../styles/global.css"

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <>
      <WagmiProvider>
        <Head>
          <title>goldilocks v0.2</title>
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout> 
      </WagmiProvider>
    </>
  )
}

export default MyApp