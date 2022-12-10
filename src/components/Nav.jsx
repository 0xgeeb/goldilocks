import React, { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function Nav({ currentAccount, setCurrentAccount, avaxChain, setAvaxChain }) {

  useEffect(() => {
    checkConnectionandChain()
  }, [])

  async function checkConnectionandChain() {
    const accounts = await ethereum.request({ method: 'eth_accounts'})
    if(accounts.length) {
      setCurrentAccount(accounts[0])
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const { chainId } = await provider.getNetwork()
    if (chainId === 43113) {
      setAvaxChain(chainId)
    }
  }

  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setCurrentAccount(accounts[0])
  }

  return (
    <div className="w-[100%] mt-12 flex flex-row items-center justify-between px-5">
      <a href="/"><h1 className="text-[30px]">goldilocks</h1></a>
      <div className="flex flex-row">
        <a href="/amm"><button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mr-4" >AMM</button></a>
        <a href="/staking"><button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mr-4" >Staking</button></a>
        <a href="/borrowing"><button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mr-4" >Borrowing</button></a>
        <button className={`px-8 py-2 ${currentAccount ? "bg-green-300" : "bg-slate-200"} hover:bg-slate-500 rounded-xl`} onClick={connectWallet}>{currentAccount ? "connected" : "connect wallet"}</button>
      </div>
    </div>
  )
}