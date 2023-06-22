import React, { ReactElement } from "../../node_modules/@types/react"

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

export interface SlippagePopupProps {
  slippage: number;
  setSlippage: React.Dispatch<React.SetStateAction<number>>;
  slippageToggle: boolean;
  setSlippageToggle: React.Dispatch<React.SetStateAction<boolean>>;
  slippageDisplayString: string;
  setSlippageDisplayString: React.Dispatch<React.SetStateAction<string>>;
}

export interface ToggleProps {
  activeToggle: string;
  setActiveToggle: React.Dispatch<React.SetStateAction<string>>;
  slippageToggle: boolean;
  setSlippageToggle: React.Dispatch<React.SetStateAction<boolean>>;
}