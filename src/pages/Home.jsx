import React, { useEffect, useState } from "react"
import { ethers } from "ethers";
import PorridgeTokenContract from "../utils/PorridgeToken.json";

export default function Home() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [stake, setStake] = useState();
  const [unstake, setUnstake] = useState();
  const [realize, setRealize] = useState();
  const [staked, setStaked] = useState();

  const porridgeContractAddress = "0x286B8DecD5ED79c962b2d8F4346CD97FF0E2C352";

  useEffect(() => {
    checkStaked(currentAccount);
  }, [currentAccount]);

  async function checkStaked(account) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const porridgeTokenContract = new ethers.Contract(porridgeContractAddress, PorridgeTokenContract.abi, signer);
    const checkStakedTx = await porridgeTokenContract.getStaked(account);
    setStaked(parseInt(checkStakedTx._hex, 16));
  }

  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    setCurrentAccount(account);
    console.log(account)
  }

  async function stakeFunction() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const porridgeTokenContract = new ethers.Contract(porridgeContractAddress, PorridgeTokenContract.abi, signer);
    const stakeTx = await porridgeTokenContract.stake(stake);
    await stakeTx.wait();
  }

  async function unstakeFunction() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const porridgeTokenContract = new ethers.Contract(porridgeContractAddress, PorridgeTokenContract.abi, signer);
    const unstakeTx = await porridgeTokenContract.unstake(unstake);
    await unstakeTx.wait();
  }
  
  async function realizeFunction() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const porridgeTokenContract = new ethers.Contract(porridgeContractAddress, PorridgeTokenContract.abi, signer);
    const realizeTx = await porridgeTokenContract.realize(realize);
    await realizeTx.wait();

  }
  async function claimFunction() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const porridgeTokenContract = new ethers.Contract(porridgeContractAddress, PorridgeTokenContract.abi, signer);
    const claimTx = await porridgeTokenContract.claim();
    await claimTx.wait();
  }

  return (
    <div className="px-6">
      <div className="w-[100%] mt-12 flex flex-row items-center justify-between">
        <h1 className="text-[30px]">goldilocks</h1>
        <div className="flex flex-rw">
        <button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mr-4" ><a href="">rinkeby faucet</a></button>
          <button className={`px-8 py-2 ${currentAccount ? "bg-green-300" : "bg-slate-200"} hover:bg-slate-500 rounded-xl`} onClick={connectWallet}>{currentAccount ? "connected" : "connect wallet"}</button>
        </div>
      </div>
      <div className="w-[100%] flex flex-row mt-24">
        <div className="w-[25%] flex flex-col px-4">
          <h2 className="mx-auto">amm</h2>
          <button className="mt-8 px-12 py-3 bg-slate-200 hover:bg-slate-500 rounded-xl mx-auto">buy</button>
          <button className="mt-8 px-12 py-3 bg-slate-200 hover:bg-slate-500 rounded-xl mx-auto">sell</button>
          <button className="mt-8 px-12 py-3 bg-slate-200 hover:bg-slate-500 rounded-xl mx-auto">redeem</button>
        </div>
        <div className="w-[25%] flex flex-col p-4 rounded-xl bg-yellow-100" id="card-div-shadow">
          <h1 className="mx-auto text-xl">staking</h1>
          <div className="flex justify-around flex-row items-center mt-8">
            <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={stakeFunction}>stake</button>
            <input type="number" value={stake} id="input" className="w-24 pl-3 rounded" onChange={(e) => setStake(e.target.value)}/>
          </div>
          <div className="flex justify-around flex-row items-center mt-8">
            <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={unstakeFunction}>unstake</button>
            <input type="number" value={unstake} id="input" className="w-24 pl-3 rounded" onChange={(e) => setUnstake(e.target.value)}/>
          </div>
          <div className="flex justify-around flex-row items-center mt-8">
            <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={realizeFunction}>realize</button>
            <input type="number" value={realize} id="input" className="w-24 pl-3 rounded" onChange={(e) => setRealize(e.target.value)}/>
          </div>
          <button className="mx-auto mt-8 px-12 py-3 w-48 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={claimFunction}>claim yield</button>
        </div>
        <div className="w-[25%] flex flex-col px-4">
          <h2 className="mx-auto">borrowing</h2>
          <button className="mt-8 px-12 py-3 bg-slate-200 hover:bg-slate-500 rounded-xl mx-auto">borrow</button>
          <button className="mt-8 px-12 py-3 bg-slate-200 hover:bg-slate-500 rounded-xl mx-auto">repay</button>
        </div>
        <div className="w-[25%] flex flex-col px-4">
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
        <div className="w-[25%] flex flex-col px-24">
          <div className="mt-8 flex flex-row justify-between">
            <p className="">staked balance: </p>
            <p>{staked}</p>
          </div>
        </div>
        <div className="w-[25%] flex flex-col">
          <p className="mt-8">borrowed balance: </p>
        </div>
      </div>
    </div>
  )
}