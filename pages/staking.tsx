import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useSpring, animated } from "@react-spring/web"
import Bear from "./components/Bear"
import porridgeABI from "./abi/Porridge.json"
import locksABI from "./abi/Locks.json"
import testhoneyABI from "./abi/TestHoney.json"
import ammABI from "./abi/AMM.json"
import { useAccount, useContractReads, useNetwork, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi"

export default function Staking() {
  
  const [input, setInput] = useState()
  const [staked, setStaked] = useState()
  const [locksAllowance, setLocksAllowance] = useState(null)
  const [honeyAllowance, setHoneyAllowance] = useState(null)
  const [locksBalance, setLocksBalance] = useState()
  const [porridgeBalance, setPorridgeBalance] = useState()
  const [claimBalance, setClaimBalance] = useState()
  const [floorPrice, setFloorPrice] = useState()
  
  const [stakeToggle, setStakeToggle] = useState(true)
  const [unstakeToggle, setUnstakeToggle] = useState(false)
  const [realizeToggle, setRealizeToggle] = useState(false)

  const account = useAccount()
  const chain = useNetwork()

  const springs = useSpring({
    from: { x: -900 },
    to: { x: 0 },
  })

  function handlePill(action: number) {
    setInput('')
    if(action === 1) {
      setStakeToggle(true)
      setUnstakeToggle(false)
      setRealizeToggle(false)
    }
    if(action === 2) {
      setStakeToggle(false)
      setUnstakeToggle(true)
      setRealizeToggle(false)
    }
    if(action === 3) {
      setStakeToggle(false)
      setUnstakeToggle(false)
      setRealizeToggle(true)
    }
  }

  async function getContractData() {
    const provider = new ethers.providers.JsonRpcProvider(quickNodeFuji.rpcUrls[0])
    const porridgeContractObject = new ethers.Contract(porridgeAddy, porridgeABI.abi, provider)
    const locksContractObject = new ethers.Contract(locksAddy, locksABI.abi, provider)
    const ammContractObject = new ethers.Contract(ammAddy, ammABI.abi, provider)
    const fslReq = await ammContractObject.fsl()
    const supplyReq = await ammContractObject.supply()
    setFloorPrice(parseInt(fslReq._hex, 16) / Math.pow(10, 18) / parseInt(supplyReq._hex, 16) / Math.pow(10, 18))
    if(currentAccount) {
      const locksBalanceReq = await locksContractObject.balanceOf(currentAccount)
      setLocksBalance(parseInt(locksBalanceReq._hex, 16) / Math.pow(10, 18))
      const stakedReq = await porridgeContractObject.getStaked(currentAccount)
      setStaked(parseInt(stakedReq._hex, 16) / Math.pow(10, 18))
      const porridgeBalanceReq = await porridgeContractObject.balanceOf(currentAccount)
      setPorridgeBalance(parseInt(porridgeBalanceReq._hex, 16) / Math.pow(10, 18))
      const claimBalanceReq = await porridgeContractObject._calculateYield(currentAccount)
      setClaimBalance(parseInt(claimBalanceReq._hex, 16) / Math.pow(10, 18))
    }
  }


  async function checkLocksAllowance() {
    const provider = new ethers.providers.JsonRpcProvider(quickNodeFuji.rpcUrls[0])
    const locksContractObject = new ethers.Contract(locksAddy, locksABI.abi, provider)
    const allowanceReq = await locksContractObject.allowance(currentAccount, porridgeAddy)
    setLocksAllowance(parseInt(allowanceReq._hex, 16) / Math.pow(10, 18))
    return parseInt(allowanceReq._hex, 16) / Math.pow(10, 18)
  }

  async function approveLocksInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const locksContractObject = new ethers.Contract(locksAddy, locksABI.abi, signer)
    const approveTx = await locksContractObject.approve(porridgeAddy, ethers.utils.parseUnits(input.toString(), 18))
    approveTx.wait()
  }

  async function checkHoneyAllowance() {
    const provider = new ethers.providers.JsonRpcProvider(quickNodeFuji.rpcUrls[0])
    const testhoneyContractObject = new ethers.Contract(testhoneyAddy, testhoneyABI.abi, provider)
    const allowanceReq = await testhoneyContractObject.allowance(currentAccount, porridgeAddy)
    setHoneyAllowance(parseInt(allowanceReq._hex, 16) / Math.pow(10, 18))
    return parseInt(allowanceReq._hex, 16) / Math.pow(10, 18)
  }

  async function approveHoneyInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const honeyContractObject = new ethers.Contract(testhoneyAddy, testhoneyABI.abi, signer)
    const approveTx = await honeyContractObject.approve(porridgeAddy, ethers.utils.parseUnits((input * floorPrice).toString(), 18))
    approveTx.wait()
  }

  async function handleButtonClick() {
    if(!currentAccount) {
      connectWallet()
    }
    else if(!avaxChain) {
      switchToFuji()
    }
    else {
      if(stakeToggle) {
        if(locksAllowance >= input) {
          stakeFunctionInteraction()
        }
        else {
          const locksAllowanceReq = await checkLocksAllowance()
          if(locksAllowanceReq >= input) {
            return
          }
          else {
            approveLocksInteraction()
          }
        }
      }
      if(unstakeToggle) {
        unstakeFunctionInteraction()
      }
      if(realizeToggle) {
        if(honeyAllowance >= input * floorPrice) {
          realizeFunctionInteraction()
        }
        else {
          const honeyAllowanceReq = await checkHoneyAllowance()
          if(honeyAllowanceReq >= input * floorPrice) {
            return
          }
          else {
            approveHoneyInteraction()
          }
        }
      }
    }
  }

  function renderButton() {
    if(!currentAccount) {
      return 'connect wallet'
    }
    else if(!avaxChain) {
      return 'switch to fuji plz'
    }
    else {
      if(stakeToggle) {
        if(locksAllowance >= input) {
          return 'stake'
        }
        else {
          return 'approve'
        }
      }
      if(unstakeToggle) {
        return 'unstake'
      }
      if(realizeToggle) {
        return 'realize'
      }
    }
  }

  function renderLabel() {
    if(stakeToggle) {
      return 'stake'
    }
    if(unstakeToggle) {
      return 'unstake'
    }
    if(realizeToggle) {
      return 'realize'
    }
  }

  return (
    <div className="flex flex-row py-3">
      <animated.div className="w-[57%] flex flex-col pt-8 pb-2 px-16 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black" style={springs}>
        <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline">staking</h1>
        <div className="flex flex-row ml-2 items-center justify-between">
          <h3 className="font-acme text-[24px] ml-2">staking $locks for $porridge</h3>
          <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
            <div className={`font-acme w-20 py-2 ${stakeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(1)}>stake</div>
            <div className={`font-acme w-20 py-2 ${unstakeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(2)}>unstake</div>
            <div className={`font-acme w-20 py-2 ${realizeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} onClick={() => handlePill(3)}>realize</div>
          </div>
        </div>
        <div className="h-[100%] mt-4 flex flex-row">
          <div className="w-[60%] flex flex-col">
            <div className="rounded-3xl border-2 border-black w-[100%] h-[60%] bg-white flex flex-col relative">
              <h1 className="font-acme text-[40px] ml-10 mt-16">{renderLabel()}</h1>
              <div className="absolute top-[45%]">
                <input className="border-none focus:outline-none font-acme rounded-xl text-[40px] pl-10" placeholder="0" type="number" value={input} onChange={(e) => setInput(e.target.value)} id="number-input" autoFocus />
              </div>
            </div>
            <div className="h-[15%] w-[80%] mx-auto mt-6">
              <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
            </div>
          </div>
          <div className="flex flex-col w-[40%] h-[100%] mt-4 ml-4">
            <div className="w-[100%] h-[50%] flex p-6 flex-col bg-white rounded-xl border-2 border-black">
              <div className="flex flex-row justify-between items-center">
                <h1 className="font-acme text-[24px]">$LOCKS balance:</h1>
                <p className="font-acme text-[20px]">{locksBalance ? locksBalance : 0}</p>
              </div>
              <div className="flex flex-row justify-between items-center mt-3">
                <h1 className="font-acme text-[24px]">staked $LOCKS:</h1>
                <p className="font-acme text-[20px]">{staked ? staked : 0}</p>
              </div>
              <div className="flex flex-row justify-between items-center mt-3">
                <h1 className="font-acme text-[24px]">$PRG balance:</h1>
                <p className="font-acme text-[20px]">{porridgeBalance ? porridgeBalance : 0}</p>
              </div>
              <div className="flex flex-row justify-between items-center mt-8">
                <h1 className="font-acme text-[20px]">$PRG available to claim:</h1>
                <p className="font-acme text-[20px]">{claimBalance ? claimBalance : 0}</p>
              </div>
            </div>
            {currentAccount && avaxChain && <div className="h-[10%] w-[70%] mx-auto mt-4">
              <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[25px]" id="amm-button" onClick={() => claimFunctionInteraction()} >claim yield</button>
            </div>}
          </div>
        </div>
      </animated.div>
      <Bear />
    </div>
  )
}