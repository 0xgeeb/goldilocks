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
  staked: number;
  claimable: number;
  locked: number;
  borrowed: number;
}

export interface WalletInitialState {
  balance: BalanceState;
  wallet: string;
  isConnected: boolean;
  signer: WalletClient | null;
  network: string;
  refreshBalances: () => void;
  sendMintTx: () => Promise<string>;
  sendGoldiMintTx: () => Promise<string>;
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
  targetRatio: number;
  lastFloorRaise: number;
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
  checkSlippageAmount: () => void;
  redeemPopupToggle: boolean;
  setRedeemPopupToggle: (_bool: boolean) => void;
  activeToggle: string;
  changeActiveToggle: (_toggle: string) => void;
  displayString: string;
  bottomDisplayString: string;
  changeNewInfo: (_fsl: number, _psl: number, _floor: number, _market: number, _supply: number, _ratio: number, _raise: number) => void;
  simulateBuy: (_amt: number) => void;
  simulateSell: (_amt: number) => void;
  simulateRedeem: (_amt: number) => void;
  handlePercentageButtons: (_action: number) => void;
  flipTokens: () => void;
  handleTopChange: (_input: string) => void;
  handleTopBalance: () => string;
  handleBottomChange: (_input: string) => void;
  handleBottomBalance: () => string;
  debouncedHoneyBuy: number;
  debouncedGettingHoney: number;
  findLocksBuyAmount: (_debouncedValue: number) => number;
  findLocksSellAmount: (_debouncedValue: number) => number;
  refreshGammInfo: () => void;
  refreshChartInfo: () => void;
}

export interface StakingInfo {
  fsl: number;
  supply: number;
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
  realizePopupToggle: boolean;
  setRealizePopupToggle: (_bool: boolean) => void;
  renderLabel: () => string;
  handleBalance: () => string;
  handlePercentageButtons: (_action: number) => void;
  handleChange: (_input: string) => void;
  refreshStakingInfo: () => void;
}

export interface BorrowInfo {
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
  borrowPopupToggle: boolean;
  setBorrowPopupToggle: (_bool: boolean) => void;
  handlePercentageButtons: (_action: number) => void;
  renderLabel: () => string;
  handleChange: (_input: string) => void;
  handleBalance: () => string;
  refreshBorrowInfo: () =>  void;
}

export interface BeraInfo {
  name: string;
  id: number;
  imageSrc: string;
  valuation: number;
  index: number;
}

export interface PartnerInfo {
  name: string;
  id: number;
  imageSrc: string;
  boost: number;
  index: number;
}

export interface BoostInfo {
  partnerNFTs: string[];
  partnerNFTIds: number[];
  boostMagnitude: number;
  expiry: number;
}

export interface GoldilendInfo {
  userBoost: BoostInfo;
  // userLoans:
}

export interface BoostData {
  partnerNFTs: string[];
  partnerNFTIds: bigint[];
  boostMagnitude: bigint;
  expiry: bigint;
}

export interface LoanData {
  collateralNFTs: string[];
  collateralNFTIds: bigint[];
  borrowedAmount: bigint;
  interest: bigint;
  duration: bigint;
  endDate: bigint;
  loanId: bigint;
  liquidated: boolean;
}

export interface GoldilendInitialState {
  goldilendInfo: GoldilendInfo;
  loanAmount: number;
  displayString: string;
  activeToggle: string;
  borrowLimit: number;
  loanExpiration: string;
  boostExpiration: string;
  changeActiveToggle: (_toggle: string) => void;
  getOwnedBeras: () => {};
  getOwnedPartners: () => {};
  findBoost: () => {};
  findLoans: () => {};
  ownedBeras: BeraInfo[];
  ownedPartners: PartnerInfo[];
  selectedBeras: BeraInfo[];
  selectedPartners: PartnerInfo[];
  handleBorrowChange: (_input: string) => void;
  handleLoanDateChange: (_input: string) => void;
  handleBoostDateChange: (_input: string) => void;
  handleBeraClick: (_bera: BeraInfo) => void;
  handlePartnerClick: (_bera: PartnerInfo) => void;
  findSelectedBeraIdxs: () => number[];
  findSelectedPartnerIdxs: () => number[];
  updateBorrowLimit: () => void;
  loanPopupToggle: boolean;
  setLoanPopupToggle: (_bool: boolean) => void;
  clearOutBoostInputs: () => void;
}

export interface SideToggleProps {
  showChart: boolean;
  toggleChart: MouseEventHandler<HTMLButtonElement>; 
}