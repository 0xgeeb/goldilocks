import { AppProps } from "next/app"
import Head from "next/head"
import Layout from "../components/Layout"
import { WagmiProvider } from "../providers/WagmiProvider"
import { WalletProvider } from "../providers/WalletProvider"
import { NotificationProvider } from "../providers/NotificationProvider"
import NotificationManager from "../components/NotificationManager"
import "../styles/global.css"

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <NotificationProvider>
      <WagmiProvider>
        <WalletProvider>
          <Head>
            <title>Goldilocks v0.2</title>
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout> 
          <NotificationManager />
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}

export default MyApp