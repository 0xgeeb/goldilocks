import type { Metadata } from 'next'
import {
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  GammProvider
} from "../../providers"
import {
  GammBox,
  GammImages
} from "../../components/gamm"
import { NotificationManager } from "../../components/notifications"
import { NavBar } from "../../components/nav"

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
              <div className="h-[80%] flex flex-row">
                <GammBox />
                <GammImages />
              </div>
            </div>
            <NotificationManager />
          </GammProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}