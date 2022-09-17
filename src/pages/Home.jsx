import React from "react"

export default function Home() {
  return (
    <div className="px-6">
      <div className="w-[100%] mt-12 flex flex-row items-center justify-between">
        <h1 className="text-[30px]">goldilocks</h1>
        <div className="flex flex-rw">
        <button className="px-8 py-2 bg-slate-300 hover:bg-slate-500 rounded-xl mr-4"><a href="">rinkeby faucet</a></button>
          <button className="px-8 py-2 bg-slate-300 hover:bg-slate-500 rounded-xl">connect wallet</button>
        </div>
      </div>
      <div className="w-[100%] flex flex-row mt-24">
        <div className="w-[25%] flex flex-col">
          <h2 className="mx-auto">amm</h2>
          <button className="mt-8 px-12 py-3 bg-slate-300 hover:bg-slate-500 rounded-xl mx-auto">buy</button>
          <button className="mt-8 px-12 py-3 bg-slate-300 hover:bg-slate-500 rounded-xl mx-auto">sell</button>
          <button className="mt-8 px-12 py-3 bg-slate-300 hover:bg-slate-500 rounded-xl mx-auto">redeem</button>
        </div>
        <div className="w-[25%] flex flex-col">
          <h2 className="mx-auto">staking</h2>
          <button className="mt-8 px-12 py-3 bg-slate-300 hover:bg-slate-500 rounded-xl mx-auto">stake</button>
          <button className="mt-8 px-12 py-3 bg-slate-300 hover:bg-slate-500 rounded-xl mx-auto">unstake</button>
          <button className="mt-8 px-12 py-3 bg-slate-300 hover:bg-slate-500 rounded-xl mx-auto">claim</button>
          <button className="mt-8 px-12 py-3 bg-slate-300 hover:bg-slate-500 rounded-xl mx-auto">realize</button>
        </div>
        <div className="w-[25%] flex flex-col ">
          <h2 className="mx-auto">borrowing</h2>
          <button className="mt-8 px-12 py-3 bg-slate-300 hover:bg-slate-500 rounded-xl mx-auto">borrow</button>
          <button className="mt-8 px-12 py-3 bg-slate-300 hover:bg-slate-500 rounded-xl mx-auto">repay</button>
        </div>
        <div className="w-[25%] flex flex-col">
          <h2 className="mx-auto">wallet</h2>
          <p className="mt-8">rinkeby $ETH balance: </p>
          <p className="mt-8">$LOCKS balance: </p>
          <p className="mt-8">$PRG balance: </p>
        </div>
      </div>
      <div className="w-[100%] flex flex-row mt-24">
        <div className="w-[25%] flex flex-col">
          <p className="mt-8">FSL balance: </p>
          <p className="mt-8">PSL balance: </p>
        </div>
        <div className="w-[25%] flex flex-col">
          <p className="mt-8">staked balance: </p>
        </div>
        <div className="w-[25%] flex flex-col">
          <p className="mt-8">borrowed balance: </p>
        </div>
      </div>
    </div>
  )
}