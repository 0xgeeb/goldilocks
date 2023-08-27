import type { Metadata } from 'next'
import { GoldilendPage } from "../../components/goldilend"
import { NotificationManager } from "../../components/utils"
import {
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  GoldilendProvider
} from "../../providers"

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
            <GoldilendPage />
            <NotificationManager />
          </GoldilendProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}