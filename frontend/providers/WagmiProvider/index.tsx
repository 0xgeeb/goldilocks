"use client"

import { FC, ReactNode } from "react"
import { configureChains, createConfig, WagmiConfig } from "wagmi"
import { fuji } from "../../utils/customChains"
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc"
import { createPublicClient, http } from "viem"
import { connectorsForWallets, getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { metaMaskWallet, injectedWallet, rainbowWallet, rabbyWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets"
import "@rainbow-me/rainbowkit/styles.css"

const { chains } = configureChains(
  [fuji],
  [
    jsonRpcProvider({
      rpc: chain => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ]
)

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID as string

const { wallets } = getDefaultWallets({
  appName: "Goldilocks Alpha",
  projectId,
  chains
})

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ projectId, chains }),
      rainbowWallet({ projectId, chains }),
      rabbyWallet({ chains }),
      ledgerWallet({ projectId, chains })
    ]
  }
])

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient: createPublicClient({
    chain: fuji,
    transport: http(),
  })
})

export const WagmiProvider: FC<{ children: ReactNode }> = ({ children }) => 
  <WagmiConfig config={config}>
    <RainbowKitProvider chains={chains} coolMode>
      {children}
    </RainbowKitProvider>
  </WagmiConfig>