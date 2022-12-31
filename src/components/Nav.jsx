import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import logo from "../images/yellow_transparent_logo.png"
import abi from "../utils/TestHoney.json"

export default function Nav({ currentAccount, setCurrentAccount, avaxChain, setAvaxChain }) {

  useEffect(() => {
    checkConnectionandChain()
  }, [])

  const contractAddy = '0x5F4b5D0B353a7531AD1763F0a3691C11Dae8899B'

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

  async function getTestHoney() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const mintTx = await contractObjectSigner.mint(currentAccount, ethers.utils.parseUnits("100", 18));
    mintTx.wait()
  }

  return (
    <div className="w-[100%] mt-8 flex flex-row items-center justify-between px-24">
      <a href="/"><div className="flex flex-row items-center">
        <img className="w-24 h-24 hover:opacity-25" src={logo} />
        <h1 className="text-[45px] ml-5 font-acme hover:text-slate-500">Goldilocks v0.1</h1>
      </div></a>
      <div className="flex flex-row">
        <button className="w-24 py-2 text-[18px] bg-slate-200 hover:bg-slate-500 rounded-xl mr-4 font-acme" id="home-button" onClick={getTestHoney} >$honey</button>
        <a href="https://faucet.avax.network/" target="_blank"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:bg-slate-500 rounded-xl mr-24 font-acme" id="home-button">faucet</button></a>
        <a href="/amm"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:bg-slate-500 rounded-xl mr-4 font-acme" id="home-button">trade</button></a>
        <a href="/staking"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:bg-slate-500 rounded-xl mr-4 font-acme" id="home-button">stake</button></a>
        <a href="/borrowing"><button className="w-24 py-2 text-[18px] bg-slate-200 hover:bg-slate-500 rounded-xl mr-4 font-acme" id="home-button">borrow</button></a>
        <button className={`px-8 py-2 text-[18px] ${currentAccount ? "bg-green-300" : "bg-slate-200"} ${currentAccount ? "hover:bg-green-500" : "hover:bg-slate-500"} rounded-xl font-acme`} id="home-button" onClick={connectWallet}>{currentAccount ? "connected" : "connect wallet"}</button>
      </div>
    </div>
  )
}