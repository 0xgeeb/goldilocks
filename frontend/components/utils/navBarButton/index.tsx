"use client"

import { useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useWallet, useNotification } from "../../../providers"

type PopupProps = {
  burgerPopupToggle: boolean;
  setBurgerPopupToggle: React.Dispatch<React.SetStateAction<boolean>>;
  setAccountPopupToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NavBarButton = ({ burgerPopupToggle, setBurgerPopupToggle, setAccountPopupToggle }: PopupProps) => {

  const [tagText, setTagText] = useState<string>('mint $honey')
  const { openNotification } = useNotification()
  const { 
    isConnected, 
    network, 
    refreshBalances, 
    sendMintTx 
  } = useWallet()

  const handleClick = async () => {
      if(!isConnected) {
      setTagText("where wallet")
    }
    else if(network !== "Goerli test network") {
      setTagText("where goerli")
    }
    else {
      setTagText("loading...")
      const mintTx = await sendMintTx()
      mintTx && openNotification({
        title: 'Successfully Minted $HONEY!',
        hash: mintTx,
        direction: 'minted',
        amount: 1000000,
        price: 0,
        page: 'nav'
      })
      setTagText("u got $honey")
      refreshBalances()
      setTimeout(() => {
        setTagText("$honey")
      }, 5000)
    }
  }

  const loadingElement = () => {
    return <span className="loader-small"></span>
  }

  return (
    <>
      <div 
        className="relative flex flex-col lg:hidden border-2 border-black h-[50%] w-[5%] rounded-xl cursor-pointer hover:scale-125" 
        id="home-button"
        onClick={() => setBurgerPopupToggle(prev => !prev)}
      >
        <div className="absolute border-2 border-b-black border-transparent left-[10%] w-[80%] h-[25%] top-[0%]  rounded"></div>
        <div className="absolute border-2 border-b-black border-transparent left-[10%] w-[80%] h-[25%] top-[30%] rounded"></div>
        <div className="absolute border-2 border-b-black border-transparent left-[10%] w-[80%] h-[25%] top-[60%] rounded"></div>
      </div>
      { burgerPopupToggle && 
        <div className="z-40 absolute flex flex-col font-acme text-center justify-between p-4 lg:hidden left-[79%] w-[20%] top-[8%] h-[30%] border-2 border-black rounded-xl bg-white" id="home-button">
          <p 
            className="hover:underline cursor-pointer"
            onClick={() => handleClick()}
          >
            {tagText}
          </p>
          <a href="/gamm">
            <p className="hover:underline cursor-pointer">gamm</p>
          </a>
          <a href="/staking">
            <p className="hover:underline cursor-pointer">stake</p>
          </a>
          <a href="/borrowing">
            <p className="hover:underline cursor-pointer">borrow</p>
          </a>
          <a href="/goldilend">
            <p className="hover:underline cursor-pointer">goldilend</p>
          </a>
          <ConnectButton.Custom>
            {({
              account,
              mounted,
              openConnectModal
            }) => {
              return (
                !mounted ?
                  <p className="hover:underline cursor-pointer">
                    {loadingElement()}
                  </p> :
                !account ?
                  <p 
                    className="hover:underline cursor-pointer"
                    onClick={openConnectModal}
                  >
                    connect
                  </p> :
                  <p
                    className="hover:underline cursor-pointer"
                    onClick={() => setAccountPopupToggle(true)}
                  >
                    {`${account.address.slice(0, 4)}...${account?.address.slice(-3)}`}
                  </p>
              )
            }}
          </ConnectButton.Custom>
        </div>
      }
    </>
  )
}