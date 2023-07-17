import type { Metadata } from 'next'
import { StakingMainBox } from "../../components/staking"
import {
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  StakingProvider
} from "../../providers"
import { 
  NavBar,
  NotificationManager,
  RotatingImages
} from "../../components/utils"

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
            <div className="w-screen h-screen" id="page-div">
              <NavBar />
              <div className="h-[80%] flex flex-row">
                <StakingMainBox />
                <RotatingImages />
              </div>
            </div>
            <NotificationManager />
          </StakingProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}