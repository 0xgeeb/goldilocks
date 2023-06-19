import type { Metadata } from 'next'
import {
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  InfoProvider,
  TxProvider
} from "../../providers"
import {
  GammBox,
  GammImages
} from "../../components/gamm"
import { NotificationManager } from "../../components/notifications"

export const metadata: Metadata = {
  title: "mf gamm",
  description: "testing yo"
}

export default function Gamm() {

  return (
    <NotificationProvider>
      <WagmiProvider>
        <WalletProvider>
          <InfoProvider>
            <TxProvider>
              <div className="w-screen h-screen flex flex-row" id="page-div">
                <GammBox />
                <GammImages />
              </div>
              <NotificationManager />
            </TxProvider>
          </InfoProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}