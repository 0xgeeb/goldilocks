import type { Metadata } from 'next'
import { StakingPage } from "../../components/staking"
import { NotificationManager } from "../../components/utils"
import {
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  StakingProvider
} from "../../providers"

export const metadata: Metadata = {
  title: "mf staking",
  description: "testing yo"
}

export default function Staking() {

  return (
    <NotificationProvider>
      <WagmiProvider>
        <WalletProvider>
          <StakingProvider>
            <StakingPage />
            <NotificationManager />
          </StakingProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}