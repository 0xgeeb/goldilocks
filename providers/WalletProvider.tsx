import { PropsWithChildren } from "react";

export const WalletProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props
  console.log('walletprovider')
  return <>{ children }</>
}