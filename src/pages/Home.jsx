import React, { useEffect, useState } from "react"
import { ethers } from "ethers";
import LocksTokenContract from "../utils/LocksToken.json";
import PorridgeTokenContract from "../utils/PorridgeToken.json";
import AMMContract from "../utils/AMM.json";
import BorrowContract from "../utils/Borrow.json";

export default function Home() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [stake, setStake] = useState();
  const [unstake, setUnstake] = useState();
  const [realize, setRealize] = useState();
  const [staked, setStaked] = useState();
  const [borrow, setBorrow] = useState();
  const [repay, setRepay] = useState();
  const [locked, setLocked] = useState();
  const [borrowed, setBorrowed] = useState();
  const [buy, setBuy] = useState();
  const [sell, setSell] = useState();
  const [redeem, setRedeem] = useState();
  const [fsl, setFsl] = useState();
  const [psl, setPsl] = useState();
  const [lastFloorRaise, setLastFloorRaise] = useState();
  const [targetRatio, setTargetRatio] = useState();
  const [locksBalance, setLocksBalance] = useState();
  const [porridgeBalance, setPorridgeBalance] = useState();
  const [totalLocks, setTotalLocks] = useState();
  const [totalPorridge, setTotalPorridge] = useState();

  const porridgeContractAddress = "0x627b9a657eac8c3463ad17009a424dfe3fdbd0b1";
  const borrowContractAddress = "0x5ffe31e4676d3466268e28a75e51d1efa4298620";
  const locksContractAddress = "0x325c8df4cfb5b068675aff8f62aa668d1dec3c4b";
  const ammContractAddress = "0x4eab29997d332a666c3c366217ab177cf9a7c436";

  function checkEffect() {
    checkStaked(currentAccount);
    checkBorrowed(currentAccount);
    checkLocked(currentAccount);
    checkFsl();
    checkPsl();
    checkLastFloorRaise();
    checkTargetRatio();
    checkTotalLocks();
    checkTotalPorridge();
    checkLocksBalance(currentAccount);
    checkPorridgeBalance(currentAccount);
  }

  async function checkStaked(account) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const porridgeTokenContract = new ethers.Contract(porridgeContractAddress, PorridgeTokenContract.abi, signer);
    const checkStakedTx = await porridgeTokenContract.getStaked(account);
    if(checkStakedTx._hex == "0x00") {
      setStaked(0);
    }
    else {
      setStaked(parseInt(checkStakedTx._hex, 16));
    }
  }

  async function checkLocked(account) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const borrowContract = new ethers.Contract(borrowContractAddress, BorrowContract.abi, signer);
    const checkLockedTx = await borrowContract.getLocked(account);
    if(checkLockedTx._hex == "0x00") {
      setLocked(0);
    }
    else {
      setLocked(parseInt(checkLockedTx._hex, 16));
    }
  }

  async function checkBorrowed(account) {
    console.log('hello')
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const borrowContract = new ethers.Contract(borrowContractAddress, BorrowContract.abi, signer);
    const checkBorrowedTx = await borrowContract.getBorrowed(account);
    if(checkBorrowedTx._hex == "0x00") {
      setBorrowed(0);
    }
    else {
      setBorrowed(parseInt(checkBorrowedTx._hex, 16));
    }
  }

  async function checkFsl() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const ammContract = new ethers.Contract(ammContractAddress, AMMContract.abi, signer);
    const checkFslTx = await ammContract.fsl();
    if(checkFslTx._hex == "0x00") {
      setFsl(0);
    }
    else {
      setFsl(parseInt(checkFslTx._hex, 16));
    }
  }

  async function checkPsl() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const ammContract = new ethers.Contract(ammContractAddress, AMMContract.abi, signer);
    const checkPslTx = await ammContract.psl();
    if(checkPslTx._hex == "0x00") {
      setPsl(0);
    }
    else {
      setPsl(parseInt(checkPslTx._hex, 16));
    }
  }

  async function checkLastFloorRaise() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const ammContract = new ethers.Contract(ammContractAddress, AMMContract.abi, signer);
    const checkLastFloorRaiseTx = await ammContract.lastFloorRaise();
    const timestamp = parseInt(checkLastFloorRaiseTx._hex, 16)*1000;
    const dateObject = new Date(timestamp);
    setLastFloorRaise(dateObject.toLocaleString());
  }

  async function checkTargetRatio() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const ammContract = new ethers.Contract(ammContractAddress, AMMContract.abi, signer);
    const checkTargetRatioTx = await ammContract.targetRatio();
    setTargetRatio(parseInt(checkTargetRatioTx._hex, 16));
  }

  async function checkLocksBalance(account) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const locksTokenContract = new ethers.Contract(locksContractAddress, LocksTokenContract.abi, signer);
    const checkBalanceTx = await locksTokenContract.balanceOf(account);
    if(checkBalanceTx._hex == "0x00") {
      setLocksBalance(0);
    }
    else {
      setLocksBalance(parseInt(checkBalanceTx._hex, 16));
    }
  }

  async function checkPorridgeBalance(account) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const porridgeTokenContract = new ethers.Contract(porridgeContractAddress, PorridgeTokenContract.abi, signer);
    const checkBalanceTx = await porridgeTokenContract.balanceOf(account);
    if(checkBalanceTx._hex == "0x00") {
      setPorridgeBalance(0);
    }
    else {
      setPorridgeBalance(parseInt(checkBalanceTx._hex, 16));
    }
  }

  async function checkTotalLocks() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const locksTokenContract = new ethers.Contract(locksContractAddress, LocksTokenContract.abi, signer);
    const checkTotalTx = await locksTokenContract.totalSupply();
    if(checkTotalTx._hex == "0x00") {
      setTotalLocks(0);
    }
    else {
      setTotalLocks(parseInt(checkTotalTx._hex, 16));
    }
  }

  async function checkTotalPorridge() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const porridgeTokenContract = new ethers.Contract(porridgeContractAddress, PorridgeTokenContract.abi, signer);
    const checkTotalTx = await porridgeTokenContract.totalSupply();
    if(checkTotalTx._hex == "0x00") {
      setTotalPorridge(0);
    }
    else {
      setTotalPorridge(parseInt(checkTotalTx._hex, 16));
    }
  }

  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    setCurrentAccount(account);
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

  async function borrowFunction() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const borrowContract = new ethers.Contract(borrowContractAddress, BorrowContract.abi, signer);
    const borrowTx = await borrowContract.borrow(borrow);
    await borrowTx.wait();
  }

  async function repayFunction() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const borrowContract = new ethers.Contract(borrowContractAddress, BorrowContract.abi, signer);
    const repayTx = await borrowContract.repay(repay);
    await repayTx.wait();
  }

  async function buyFunction() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const ammContract = new ethers.Contract(ammContractAddress, ammContract.abi, signer);
    const buyTx = await ammContract.purchase(buy);
    await buyTx.wait();
  }

  async function sellFunction() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const ammContract = new ethers.Contract(ammContractAddress, ammContract.abi, signer);
    const sellTx = await ammContract.sell(sell);
    await sellTx.wait();
  }

  async function redeemFunction() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const ammContract = new ethers.Contract(ammContractAddress, ammContract.abi, signer);
    const redeemTx = await ammContract.redeem(redeem);
    await redeemTx.wait();
  }

  return (
    <div className="px-6">
      <div className="w-[100%] mt-12 flex flex-row items-center justify-between">
        <h1 className="text-[30px]">goldilocks</h1>
        <div className="flex flex-row">
          <button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mr-4" onClick={checkEffect}>refresh</button>
          <button className={`px-8 py-2 ${currentAccount ? "bg-green-300" : "bg-slate-200"} hover:bg-slate-500 rounded-xl`} onClick={connectWallet}>{currentAccount ? "connected" : "connect wallet"}</button>
        </div>
      </div>
      <div className="w-[100%] flex flex-row mt-24 justify-center">
        <div className="w-[25%] flex flex-col p-4 rounded-xl bg-yellow-100 mr-4" id="card-div-shadow">
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
        <div className="w-[25%] flex flex-col p-4 rounded-xl bg-yellow-100 mr-4" id="card-div-shadow">
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
        <div className="w-[25%] flex flex-col p-4 rounded-xl bg-yellow-100 mr-4" id="card-div-shadow">
          <h2 className="mx-auto text-xl">borrowing</h2>
          <div className="flex justify-around flex-row items-center mt-16">
            <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={borrowFunction}>borrow</button>
            <input type="number" value={borrow} id="input" className="w-24 pl-3 rounded" onChange={(e) => setBorrow(e.target.value)}/>
          </div>
          <div className="flex justify-around flex-row items-center mt-8">
            <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={repayFunction}>repay</button>
            <input type="number" value={repay} id="input" className="w-24 pl-3 rounded" onChange={(e) => setRepay(e.target.value)}/>
          </div>
        </div>
        <div className="w-[25%] flex flex-col p-4 rounded-xl bg-yellow-100 mr-4" id="card-div-shadow">
          <h2 className="mx-auto text-xl">wallet</h2>
          <div className="px-16">
            <div className="mt-24 flex flex-row justify-between">
              <p className="">$LOCKS balance: </p>
              <p>{locksBalance}</p>
            </div>
            <div className="mt-8 flex flex-row justify-between">
              <p className="">$PRG balance: </p>
              <p>{porridgeBalance}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[100%] flex flex-row mt-24">
        <div className="w-[25%] flex flex-col px-24">
          <div className="mt-8 flex flex-row justify-between">
            <p className="">fsl balance: </p>
            <p>{fsl}</p>
          </div>
          <div className="mt-8 flex flex-row justify-between">
            <p className="">psl balance: </p>
            <p>{psl}</p>
          </div>
          <div className="mt-8 flex flex-row justify-between">
            <p>last floor raise: </p>
            <p>{lastFloorRaise}</p>
          </div>
          <div className="mt-8 flex flex-row justify-between">
            <p>target ratio: </p>
            <p>{(targetRatio / 10**36).toFixed(2)+"%"}</p>
          </div>
        </div>
        <div className="w-[25%] flex flex-col px-24">
          <div className="mt-8 flex flex-row justify-between">
            <p className="">staked $LOCKS: </p>
            <p>{staked}</p>
          </div>
        </div>
        <div className="w-[25%] flex flex-col px-24">
          <div className="mt-8 flex flex-row justify-between">
            <p className="">borrowed $USDC: </p>
            <p>{borrowed}</p>
          </div>
          <div className="mt-8 flex flex-row justify-between">
            <p>locked $LOCKS: </p>
            <p>{locked}</p>
          </div>
        </div>
        <div className="w-[25%] flex flex-col px-24">
          <div className="mt-8 flex flex-row justify-between">
            <p className="">total $LOCKS: </p>
            <p>{totalLocks}</p>
          </div>
          <div className="mt-8 flex flex-row justify-between">
            <p>total $PRG: </p>
            <p>{totalPorridge}</p>
          </div>
        </div>
      </div>
    </div>
  )
}