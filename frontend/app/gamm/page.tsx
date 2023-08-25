import type { Metadata } from 'next'
import { GammPage } from "../../components/gamm"
import { NotificationManager } from "../../components/utils"
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
            <GammPage />
            <NotificationManager />
          </GammProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}