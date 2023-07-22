import type { Metadata } from 'next'
import { GammMainBox } from "../../components/gamm"
import {
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  GammProvider
} from "../../providers"
import { 
  NavBar,
  NotificationManager,
  RotatingImages
} from "../../components/utils"

export const metadata: Metadata = {
  title: "mf gamm",
  description: "testing yo"
}

export default function Gamm() {

  return (
    <NotificationProvider>
      <WagmiProvider>
        <WalletProvider>
          <GammProvider>
            <div className="w-screen h-screen" id="page-div">
              <NavBar />
              <div className="h-[80%]">
                <GammMainBox />
                <RotatingImages />
              </div>
            </div>
            <NotificationManager />
          </GammProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}