import { FC, ReactNode } from "react"
import { configureChains, createClient, WagmiConfig } from "wagmi"
import { avalancheFuji } from "@wagmi/core/chains"
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc"
import { connectorsForWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { metaMaskWallet, injectedWallet, rainbowWallet, walletConnectWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets"
import "@rainbow-me/rainbowkit/styles.css"

const { chains, provider } = configureChains([avalancheFuji], [
  jsonRpcProvider({
    rpc: () => ({
      http: process.env.NEXT_PUBLIC_FUJI_RPC_URL as string
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

export const WagmiProvider: FC<{ children: ReactNode }> = ({ children }) => 
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains} coolMode>
      {children}
    </RainbowKitProvider>
  </WagmiConfig>