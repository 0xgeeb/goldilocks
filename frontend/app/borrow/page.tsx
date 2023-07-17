import type { Metadata } from 'next'
import { BorrowMainBox } from "../../components/borrow"
import {
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  BorrowProvider
} from "../../providers"
import { 
  NavBar,
  NotificationManager,
  RotatingImages
} from "../../components/utils"

export const metadata: Metadata = {
  title: "mf borrowing",
  description: "testing yo"
}

export default function Borrow() {

  return (
    <NotificationProvider>
      <WagmiProvider>
        <WalletProvider>
          <BorrowProvider>
            <div className="w-screen h-screen" id="page-div">
              <NavBar />
              <div className="h-[80%] flex flex-row">
                <BorrowMainBox />
                <RotatingImages />
              </div>
            </div>
            <NotificationManager />
          </BorrowProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}