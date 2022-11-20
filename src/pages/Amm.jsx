import React, { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function Amm() {

  const [buy, setBuy] = useState();
  const [sell, setSell] = useState();
  const [redeem, setRedeem] = useState();

  async function buyFunction() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const ammContract = new ethers.Contract(ammContractAddress, AMMContract.abi, signer);
    const buyTx = await ammContract.purchase(buy);
    await buyTx.wait();
  }

  async function sellFunction() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const ammContract = new ethers.Contract(ammContractAddress, AMMContract.abi, signer);
    const sellTx = await ammContract.sell(sell);
    await sellTx.wait();
  }

  async function redeemFunction() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const ammContract = new ethers.Contract(ammContractAddress, AMMContract.abi, signer);
    const redeemTx = await ammContract.redeem(redeem);
    await redeemTx.wait();
  }


  return (
    <div className="">
      <div className="w-[45%] flex flex-col p-4 rounded-xl bg-yellow-100 ml-24 mt-24 h-[500px]" id="card-div-shadow">
        <h2 className="mx-auto text-xl">amm</h2>
        <div className="flex justify-around flex-row items-center mt-8">
          <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={buyFunction}>buy</button>
          <input type="number" value={buy} id="input" className="w-24 pl-3 rounded" onChange={(e) => setBuy(e.target.value)}/>
        </div>
        <div className="flex justify-around flex-row items-center mt-8">
          <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={sellFunction}>sell</button>
          <input type="number" value={sell} id="input" className="w-24 pl-3 rounded" onChange={(e) => setSell(e.target.value)}/>
        </div>
        <div className="flex justify-around flex-row items-center mt-8">
          <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={redeemFunction}>redeem</button>
          <input type="number" value={redeem} id="input" className="w-24 pl-3 rounded" onChange={(e) => setRedeem(e.target.value)}/>
        </div>
      </div>
    </div>
  )
}