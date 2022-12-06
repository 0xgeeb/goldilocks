import React, { useEffect, useState } from "react"
import { ethers } from "ethers";
import LocksTokenContract from "../utils/LocksToken.json";
import PorridgeTokenContract from "../utils/PorridgeToken.json";
import AMMContract from "../utils/AMM.json";
import BorrowContract from "../utils/Borrow.json";

export default function Home() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [borrow, setBorrow] = useState();
  const [repay, setRepay] = useState();
  const [locked, setLocked] = useState();
  const [borrowed, setBorrowed] = useState();
  const [fsl, setFsl] = useState();
  const [psl, setPsl] = useState();
  const [lastFloorRaise, setLastFloorRaise] = useState();
  const [targetRatio, setTargetRatio] = useState();
  const [locksBalance, setLocksBalance] = useState();
  const [porridgeBalance, setPorridgeBalance] = useState();
  const [totalLocks, setTotalLocks] = useState();
  const [totalPorridge, setTotalPorridge] = useState();

  const porridgeContractAddress = "0xc32609c91d6b6b51d48f2611308fef121b02041f";
  const borrowContractAddress = "0x262e2b50219620226c5fb5956432a88fffd94ba7";
  const locksContractAddress = "0x8e45c0936fa1a65bdad3222befec6a03c83372ce";
  const ammContractAddress = "0xbee6ffc1e8627f51ccdf0b4399a1e1abc5165f15";

  function checkEffect() {
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

  async function checkslpFsl() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const slpContract = new ethers.Contract(slpContractAddress, SLPContract.abi, signer);
    const checkFslTx = await slpContract.mfsl();
    console.log(checkFslTx)
    if(checkFslTx._hex == "0x00") {
      setslpFsl(0);
    }
    else {
      setslpFsl(parseInt(checkFslTx._hex, 16) / (10**18));
    }
  }

  async function checkslpPsl() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const slpContract = new ethers.Contract(slpContractAddress, SLPContract.abi, signer);
    const checkPslTx = await slpContract.mpsl();
    console.log(checkPslTx)
    if(checkPslTx._hex == "0x00") {
      setslpPsl(0);
    }
    else {
      setslpPsl(parseInt(checkPslTx._hex, 16) / (10**18));
    }
  }

  return (
    <div className="px-6">
      <div className="w-[100%] flex flex-row mt-24 justify-center">
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
          {/* <div className="mt-8 flex flex-row justify-between">
            <p className="">fsl balance: </p>
            <p>{slpfsl}</p>
          </div>
          <div className="mt-8 flex flex-row justify-between">
            <p className="">psl balance: </p>
            <p>{slppsl}</p>
          </div> */}
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