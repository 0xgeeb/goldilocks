import { AppProps } from "next/app"
import Layout from "./components/Layout"
import Head from "next/head"
import { configureChains, createClient, WagmiConfig } from "wagmi"
import { avalancheFuji } from "@wagmi/core/chains"
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc"
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import "../styles/global.css"
import "@rainbow-me/rainbowkit/styles.css"

const { chains, provider } = configureChains([avalancheFuji], [
  jsonRpcProvider({
    rpc: () => ({
      http: `https://young-methodical-spree.avalanche-testnet.discover.quiknode.pro/e9ef57f113488a9db47c13766faa54b868f93ea9/ext/bc/C/rpc`
    })
  })
])

const { connectors } = getDefaultWallets({
  appName: "Goldilocks",
  chains
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <Head>
            <title>goldilocks v0.2</title>
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  )
}

export default MyApp