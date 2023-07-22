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

export default function Borrowing() {

  return (
    <NotificationProvider>
      <WagmiProvider>
        <WalletProvider>
          <BorrowProvider>
            <div className="w-screen h-screen" id="page-div">
              <NavBar />
              <BorrowMainBox />
              <RotatingImages />
            </div>
            <NotificationManager />
          </BorrowProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}