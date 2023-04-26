import { AppProps } from "next/app"
import Head from "next/head"
import Layout from "./components/Layout"
import { WagmiProvider } from "../providers/WagmiProvider"
import { WalletProvider } from "../providers/WalletProvider"
import "../styles/global.css"

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <>
      <WagmiProvider>
        <WalletProvider>
          <Head>
            <title>Goldilocks v0.2</title>
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout> 
        </WalletProvider>
      </WagmiProvider>
    </>
  )
}

export default MyApp