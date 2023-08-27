import type { Metadata } from 'next'
import { BorrowPage } from "../../components/borrow"
import { NotificationManager } from "../../components/utils"
import {
  NotificationProvider,
  WagmiProvider,
  WalletProvider,
  BorrowProvider
} from "../../providers"

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
            <BorrowPage />
            <NotificationManager />
          </BorrowProvider>
        </WalletProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}