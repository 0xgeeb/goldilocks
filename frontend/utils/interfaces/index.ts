import React, { MouseEventHandler, ReactElement } from "../../node_modules/@types/react"
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

export interface PopupProps {
  popupToggle: boolean;
  setPopupToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface BalanceState {
  locks: number;
  prg: number;
  honey: number;
}

export interface WalletInitialState {
  balance: BalanceState;
  wallet: string;
  isConnected: boolean;
  signer: WalletClient | null;
  network: string;
  refreshBalances: () => void;
  sendMintTx: () => void;
}

export interface GammInfo {
  fsl: number;
  psl: number;
  supply: number;
  targetRatio: number;
  lastFloorRaise: number;
  honeyAmmAllowance: number;
}

export interface NewInfo {
  fsl: number;
  psl: number;
  floor: number;
  market: number;
  supply: number;
}

export interface Slippage {
  amount: number;
  toggle: boolean;
  displayString: string;
}

export interface GammInitialState {
  gammInfo: GammInfo;
  newInfo: NewInfo;
  slippage: Slippage;
  honeyBuy: number;
  sellingLocks: number;
  redeemingLocks: number;
  setHoneyBuy: (_honeyBuy: number) => void;
  setBuyingLocks: (_buyingLocks: number) => void;
  setSellingLocks: (_sellingLocks: number) => void;
  setGettingHoney: (_gettingHoney: number) => void;
  setRedeemingHoney: (_redeemingHoney: number) => void;
  setRedeemingLocks: (_redeemingLocks: number) => void;
  setDisplayString: (_displayString: string) => void;
  setBottomDisplayString: (_bottomDisplayString: string) => void;
  buyingLocks: number;
  gettingHoney: number;
  redeemingHoney: number;
  topInputFlag: boolean;
  bottomInputFlag: boolean;
  setTopInputFlag: (_bool: boolean) => void;
  setBottomInputFlag: (_bool: boolean) => void;
  changeSlippage: (_amount: number, _displayString: string) => void;
  changeSlippageToggle: (_toggle: boolean) => void;
  activeToggle: string;
  changeActiveToggle: (_toggle: string) => void;
  displayString: string;
  bottomDisplayString: string;
  changeNewInfo: (_fsl: number, _psl: number, _floor: number, _market: number, _supply: number) => void;
  simulateBuy: (_amt: number) => void;
  simulateSell: (_amt: number) => void;
  simulateRedeem: (_amt: number) => void;
  handlePercentageButtons: (_action: number) => void;
  flipTokens: () => void;
  handleTopInput: () => string;
  handleTopChange: (_input: string) => void;
  handleTopBalance: () => string;
  handleBottomInput: () => string;
  handleBottomChange: (_input: string) => void;
  handleBottomBalance: () => string;
  debouncedHoneyBuy: number;
  debouncedGettingHoney: number;
  findLocksBuyAmount: (_debouncedValue: number) => number;
  findLocksSellAmount: (_debouncedValue: number) => number;
  refreshGammInfo: () => void;
}

export interface StakingInfo {
  fsl: number;
  supply: number;
  staked: number;
  yieldToClaim: number;
  locksPrgAllowance: number;
  honeyPrgAllowance: number;
}

export interface StakingInitialState {
  stakingInfo: StakingInfo;
  stake: number;
  unstake: number;
  realize: number;
  setStake: (_stake: number) => void;
  setUnstake: (_unstake: number) => void;
  setRealize: (_realize: number) => void;
  displayString: string;
  setDisplayString: (_displayString: string) => void;
  activeToggle: string;
  changeActiveToggle: (_toggle: string) => void;
  renderLabel: () => string;
  handleBalance: () => string;
  handlePercentageButtons: (_action: number) => void;
  handleChange: (_input: string) => void;
  handleInput: () => string;
  refreshStakingInfo: () => void;
}

export interface BorrowInfo {
  staked: number;
  borrowed: number;
  locked: number;
  fsl: number;
  supply: number;
  honeyBorrowAllowance: number;
}

export interface BorrowingInitialState {
  borrowInfo: BorrowInfo;
  borrow: number;
  repay: number;
  setBorrow: (_borrow: number) => void;
  setRepay: (_repay: number) => void;
  displayString: string;
  setDisplayString: (_displayString: string) => void;
  activeToggle: string;
  changeActiveToggle: (_toggle: string) => void;
  handlePercentageButtons: (_action: number) => void;
  renderLabel: () => string;
  handleInput: () => string;
  handleChange: (_input: string) => void;
  handleBalance: () => string;
  refreshBorrowInfo: () =>  void;
}

export interface SideToggleProps {
  showChart: boolean;
  toggleChart: MouseEventHandler<HTMLButtonElement>; 
}