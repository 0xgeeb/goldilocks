import type { Metadata } from 'next'
import { GammMainBox, GammSideBox } from "../../components/gamm"
import { NavBar, NotificationManager } from "../../components/utils"
import {
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  GammProvider
} from "../../providers"

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
                <GammSideBox />
              </div>
            </div>
            <NotificationManager />
          </GammProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}