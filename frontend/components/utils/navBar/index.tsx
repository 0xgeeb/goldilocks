"use client"

import Image from "next/image"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useWallet } from "../../../providers"

export const NavBar = () => {

  const { isConnected, network, refreshBalances, sendMintTx } = useWallet()

  const handleButtonClick = async () => {
    const button = document.getElementById('honey-button')

    if(!isConnected) {
      button && (button.innerHTML = "where wallet")
    }
    else if(network !== "Avalanche Fuji C-Chain") {
      button && (button.innerHTML = "where fuji")
    }
    else {
      button && (button.innerHTML = "loading...")
      await sendMintTx()
      button && (button.innerHTML = "u got $honey")
      await refreshBalances()
      setTimeout(() => {
        button && (button.innerHTML = "$honey")
      }, 5000)
    }
  }

  return (
    <div className="w-[100%] flex flex-row items-center justify-between px-24 py-8">
      <a href="/"><div className="flex flex-row items-center hover:opacity-25">
        <Image className="" src="/yellow_transparent_logo.png" alt="logo" width="96" height="96" />
        <h1 className="text-[45px] ml-5 font-acme">Goldilocks v0.3</h1>
        <h3 className="text-[25px] ml-3 font-acme">(live on devnet)</h3>
      </div></a>
      <div className="flex flex-row justify-between w-[50%]">
        <div className="flex flex-row">
          <button 
            className={`w-36 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme`} 
            id="honey-button" 
            onClick={() => handleButtonClick()}
          >
            $honey
          </button>
          <a href="https://core.app/tools/testnet-faucet" target="_blank">
            <button 
              className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl font-acme" 
              id="home-button"
            >
              faucet
            </button>
          </a>
        </div>
        <div className="flex flex-row">
          <a href="/gamm">
            <button 
              className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" 
              id="home-button"
            >
              gamm
            </button>
          </a>
          <a href="/staking">
            <button 
              className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" 
              id="home-button"
            >
              stake
            </button>
          </a>
          <a href="/borrowing">
            <button 
              className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" 
              id="home-button"
            >
              borrow
            </button>
          </a>
          <ConnectButton.Custom>
            {({
              account,
              mounted
            }) => {
              return (
                <button 
                  className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" 
                  id="home-button">
                    { 
                    !mounted ? 
                      'connect' 
                    : !account ? 
                      'connect' 
                    : 
                      `${account.address.slice(0, 4)}...${account?.address.slice(-3)}` 
                    }
                </button>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </div>
  )
}