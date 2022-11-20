import React, { useEffect, useState } from "react"

export default function Nav() {

  const [currentAccount, setCurrentAccount] = useState(null);


  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    setCurrentAccount(account);
  }


  return (
    <div className="w-[100%] mt-12 flex flex-row items-center justify-between px-5">
      <a href="/"><h1 className="text-[30px]">goldilocks</h1></a>
      <div className="flex flex-row">
        <a href="/amm"><button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mr-4" >AMM</button></a>
        <a href="/staking"><button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mr-4" >Staking</button></a>
        <a href="/borrowing"><button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mr-4" >Borrowing</button></a>
        {/* <button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mr-4" onClick={checkEffect}>refresh</button> */}
        <button className={`px-8 py-2 ${currentAccount ? "bg-green-300" : "bg-slate-200"} hover:bg-slate-500 rounded-xl`} onClick={connectWallet}>{currentAccount ? "connected" : "connect wallet"}</button>
      </div>
    </div>
  )
}