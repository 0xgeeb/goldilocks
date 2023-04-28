import React, { Dispatch, ReactNode, SetStateAction } from "react"

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