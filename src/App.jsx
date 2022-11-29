import React from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { WagmiConfig, createClient, configureChains, chain } from "wagmi"
import { publicProvider } from "wagmi/providers/public"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import "./index.css"
import Nav from "./components/Nav.jsx"
import Home from "./pages/Home.jsx"
import Amm from "./pages/Amm.jsx"
import Staking from "./pages/Staking.jsx"
import Borrowing from "./pages/Borrowing.jsx"


export default function App() {

  const fuji = {
    id: 43_113,
    name: 'Fuji (C-Chain)',
    network: 'fuji',
    nativeCurrency: {
      decimals: 18,
      name: 'Avalanche',
      symbol: 'AVAX'
    },
    rpcUrls: {
      default: 'https://young-methodical-spree.avalanche-testnet.discover.quiknode.pro/e9ef57f113488a9db47c13766faa54b868f93ea9/'
    },
    blockExplorers: {
      default: { name: 'SnowTrace', url: 'https://testnet.snowtrace.io'}
    }
  }

  const { chains, provider } = configureChains([chain.mainnet, chain.localhost, fuji], [publicProvider()])

  const client = createClient({ autoConnect: true, connectors: [new MetaMaskConnector({ chains })], provider })



  return (
    <Router>
      <WagmiConfig client={client}>
        <div className="flex flex-col relative min-w-screen min-h-screen m-0 p-0 overflow-x-hidden bg-[#F7F7F7]">
          <Nav />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/amm" element={<Amm />} />
            <Route exact path="/staking" element={<Staking />} />
            <Route exact path="/borrowing" element={<Borrowing />} />
          </Routes>
        </div>
      </WagmiConfig>
    </Router>
  )
}