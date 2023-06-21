"use client"

import Image from "next/image"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import {
  useWallet,
  useTx
} from "../../../providers"

export const NavBar = () => {

  const { wallet, isConnected, network, signer, refreshBalances } = useWallet()
  const { sendMintTx } = useTx()

  async function handleButtonClick() {
    const button = document.getElementById('honey-button')

    if(!isConnected) {
      button && (button.innerHTML = "where wallet")
    }
    else if(network !== "Avalanche Fuji C-Chain") {
      button && (button.innerHTML = "where fuji")
    }
    else {
      button && (button.innerHTML = "loading...")
      await sendMintTx(signer)
      button && (button.innerHTML = "u got $honey")
      refreshBalances(wallet, signer)
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
          <button className={`w-36 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme`} id="honey-button" onClick={() => handleButtonClick()} >$honey</button>
          <a href="http://k8s-devnet-faucet-c59c30eb9c-922569211.us-west-2.elb.amazonaws.com/" target="_blank"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl font-acme" id="home-button">faucet</button></a>
        </div>
        <div className="flex flex-row">
          <a href="/gamm"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" id="home-button">gamm</button></a>
          <a href="/staking"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" id="home-button">stake</button></a>
          <a href="/borrowing"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" id="home-button">borrow</button></a>
          <ConnectButton label="connect wallet" chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </div>
  )
}