import React from "react"

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

export interface LeftAmmBoxCurNumsProps {
  floor: number;
  market: number;
  fsl: number;
  psl: number;
}

export interface RightAmmBoxCurNumProps {
  supply: number;
}

export type NotificationProps = {
  hash: string;
  title: string;
  direction: string;
  amount: number;
  price: number;
  isOpen?: boolean;
  isError?: boolean;
}

export interface NotificationProviderState {
  notifications: Array<NotificationProps>;
  openNotification(notification: NotificationProps): void;
  closeNotification(notificationHash: string): void;
}