import type { Metadata } from 'next'
import { GoldilendMainBox } from "../../components/goldilend"
import {
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  GoldilendProvider
} from "../../providers"
import { 
  NavBar,
  NotificationManager,
  RotatingImages
} from "../../components/utils"

export const metadata: Metadata = {
  title: "mf goldilend",
  description: "testing yo"
}

export default function Borrowing() {

  return (
    <NotificationProvider>
      <WagmiProvider>
        <WalletProvider>
          <GoldilendProvider>
            <div className="w-screen h-screen" id="page-div">
              <NavBar />
              <GoldilendMainBox />
              <RotatingImages />
            </div>
            <NotificationManager />
          </GoldilendProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}