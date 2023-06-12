import { Chain } from "wagmi"

export const devnet: Chain = {
  id: 69420,
  name: 'Polaris Devnet 1',
  network: 'polaris',
  nativeCurrency: {
    decimals: 18,
    name: 'Polaris',
    symbol: 'tBERA',
  },
  rpcUrls: {
    default: { 
      http: [process.env.NEXT_PUBLIC_DEVNET_RPC_URL as string] 
    },
    public: {
      http: [process.env.NEXT_PUBLIC_DEVNET_RPC_URL as string] 
    }
  }
} as const satisfies Chain

export const fuji: Chain = {
  id: 43113,
  name: 'Avalanche Fuji C-Chain',
  network: 'fuji',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX',
  },
  rpcUrls: {
    default: { 
      http: [process.env.NEXT_PUBLIC_FUJI_RPC_URL as string] 
    },
    public: {
      http: [process.env.NEXT_PUBLIC_FUJI_RPC_URL as string] 
    }
  }
}