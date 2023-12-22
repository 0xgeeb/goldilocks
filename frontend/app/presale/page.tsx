import type { Metadata } from 'next'
import { PresalePage } from "../../components/presale"
import { NotificationManager } from "../../components/utils"
import {
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  PresaleProvider
} from "../../providers"

export const metadata: Metadata = {
  title: "mf presale",
  description: "Liquidity Generation Event Contributions"
}

export default function Presale() {

  return (
    <NotificationProvider>
      <WagmiProvider>
        <WalletProvider>
          <PresaleProvider>
            <PresalePage />
            <NotificationManager />
          </PresaleProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}