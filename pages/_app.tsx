import { AppProps } from "next/app"
import Head from "next/head"
import Layout from "../components/Layout"
import { 
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  InfoProvider,
  TxProvider
} from "../providers"
import NotificationManager from "../components/NotificationManager"
import "../styles/global.css"

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <NotificationProvider>
      <WagmiProvider>
        <WalletProvider>
          <InfoProvider>
            <TxProvider>
              <Head>
                <title>Goldilocks v0.3</title>
              </Head>
              <Layout>
                <Component {...pageProps} />
              </Layout> 
              <NotificationManager />
            </TxProvider>
          </InfoProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}

export default MyApp