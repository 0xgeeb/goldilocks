import React, { ReactElement } from "../../node_modules/@types/react"
import { WalletClient } from "viem"

export interface LayoutProps {
  children: React.ReactNode;
}

export interface Contract {
  address: string;
  abi: Array<any>;
}

export interface Contracts {
  [key: string]: Contract;
}

export type NotificationProps = {
  hash: string;
  title: string;
  direction: string;
  amount: number;
  price: number;
  page: string;
}

export interface NotificationProviderState {
  notifications: Array<NotificationProps>;
  openNotification(notification: NotificationProps): void;
  closeNotification(notificationHash: string): void;
}

export interface Pic {
  name: string;
  imageElement: ReactElement;
}

export interface RedeemPopupProps {
  popupToggle: boolean;
  setPopupToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface BalanceState {
  locks: bigint;
  prg: bigint;
  honey: bigint;
}

export interface WalletInitialState {
  balance: BalanceState;
  wallet: string;
  isConnected: boolean;
  signer: WalletClient | null;
  network: string;
  refreshBalances: () => void;
}