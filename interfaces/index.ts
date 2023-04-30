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