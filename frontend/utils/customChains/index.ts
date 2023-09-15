import { Chain } from "wagmi"

export const Goerli: Chain = {
  id: 5,
  name: 'Goerli test network',
  network: 'Goerli',
  nativeCurrency: {
    decimals: 18,
    name: 'GoerliETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { 
      http: [process.env.NEXT_PUBLIC_GOERLI_RPC_URL as string] 
    },
    public: {
      http: [process.env.NEXT_PUBLIC_GOERLI_RPC_URL as string] 
    }
  }
}