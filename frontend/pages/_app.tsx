import { AppProps } from "next/app"
import Head from "next/head"
import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import HomeLayout from "../components/HomeLayout"
import { 
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  InfoProvider,
  TxProvider
} from "../providers"
import NotificationManager from "../components/NotificationManager"
import "../app/globals.css"

function MyApp({ Component, pageProps }: AppProps) {

  const [initialRender, setInitialRender] = useState<boolean>(false)

  useEffect(() => {
    setInitialRender(true)
  }, [])

  if(!initialRender) {
    return null
  }
  else if (typeof window !== "undefined" && window.location.pathname === "/") {
    return (
      <WagmiProvider>
        <Head>
          <title>Goldilocks v0.3</title>
        </Head>
        <HomeLayout>
          <Component {...pageProps} />
        </HomeLayout>
      </WagmiProvider>
    );
  }
  else {
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
}

export default MyApp