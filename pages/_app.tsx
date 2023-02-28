import { AppProps } from "next/app"
import Layout from "./components/Layout"
import Head from "next/head"
import { configureChains, createClient, WagmiConfig } from "wagmi"
import { avalancheFuji } from "@wagmi/core/chains"
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc"
import { connectorsForWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { metaMaskWallet, injectedWallet, rainbowWallet, walletConnectWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets"
import "@rainbow-me/rainbowkit/styles.css"
import "../styles/global.css"

function MyApp({ Component, pageProps }: AppProps) {

  const { chains, provider } = configureChains([avalancheFuji], [
    jsonRpcProvider({
      rpc: () => ({
        http: `https://young-methodical-spree.avalanche-testnet.discover.quiknode.pro/e9ef57f113488a9db47c13766faa54b868f93ea9/ext/bc/C/rpc`
      })
    })
  ])
  
  const connectors = connectorsForWallets([
    {
      groupName: "Bing Chilling",
      wallets: [
        metaMaskWallet({chains, shimDisconnect: true}),
        injectedWallet({ chains, shimDisconnect: true }),
        rainbowWallet({ chains }),
        walletConnectWallet({ chains }),
        ledgerWallet({ chains })
      ]
    }
  ])
  
  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider
  })

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} coolMode>
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