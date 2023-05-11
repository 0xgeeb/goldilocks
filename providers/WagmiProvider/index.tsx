import { FC, ReactNode } from "react"
import { configureChains, createClient, WagmiConfig } from "wagmi"
import { avalancheFuji } from "@wagmi/core/chains"
import { devnet, fuji } from "../../utils/customChains"
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc"
import { connectorsForWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { metaMaskWallet, injectedWallet, rainbowWallet, rabbyWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets"
import "@rainbow-me/rainbowkit/styles.css"

const { chains, provider } = configureChains(
  [fuji],
  // [devnet],
  [
    jsonRpcProvider({
      rpc: chain => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ]
)

const connectors = connectorsForWallets([
  {
    groupName: "Goldilocks v0.3",
    wallets: [
      metaMaskWallet({chains, shimDisconnect: true}),
      injectedWallet({ chains, shimDisconnect: true }),
      rainbowWallet({ chains }),
      rabbyWallet({ chains }),
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