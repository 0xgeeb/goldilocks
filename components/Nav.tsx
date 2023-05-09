import React from "react"
import { ethers, BigNumber } from "ethers"
import Image from "next/image"
import { contracts } from "../utils"
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction, useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function Nav() {
  
  const account = useAccount()
  
  const { config } = usePrepareContractWrite({
    address: contracts.honey.address as `0x${string}`,
    abi: contracts.honey.abi,
    functionName: "mint",
    args: [account.address, BigNumber.from(ethers.utils.parseUnits("1000000", 18))],    
    enabled: true
  })

  const { data, write } = useContractWrite(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  })

  const renderButton = () => {
    if(isLoading) {
      return <div>...loading</div>
    }
    if(isSuccess) {
      return <div>u got $honey</div>
    }
    return <div>$honey</div>
  }

  return (
    <div className="w-[100%] mt-8 flex flex-row items-center justify-between px-24">
      <a href="/"><div className="flex flex-row items-center hover:opacity-25">
        <Image className="" src="/yellow_transparent_logo.png" alt="logo" width="96" height="96" />
        <h1 className="text-[45px] ml-5 font-acme">Goldilocks v0.3</h1>
        <h3 className="text-[25px] ml-3 font-acme">(live on devnet)</h3>
      </div></a>
      <div className="flex flex-row justify-between w-[50%]">
        <div className="flex flex-row">
          <button className={`${isSuccess ? "w-36" : "w-24"} py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme`} id="home-button" onClick={() => write?.()} >{renderButton()}</button>
          <a href="http://k8s-devnet-faucet-c59c30eb9c-922569211.us-west-2.elb.amazonaws.com/" target="_blank"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl font-acme" id="home-button">faucet</button></a>
        </div>
        <div className="flex flex-row">
          <a href="/amm"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" id="home-button">trade</button></a>
          <a href="/staking"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" id="home-button">stake</button></a>
          <a href="/borrowing"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" id="home-button">borrow</button></a>
          <ConnectButton label="connect wallet" chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </div>
  )
}