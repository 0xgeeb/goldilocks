import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useSpring, animated } from "@react-spring/web"
import useDebounce from "./hooks/useDebounce"
import Bear from "./components/Bear"
import borrowABI from "./abi/Borrow.json"
import locksABI from "./abi/Locks.json"
import porridgeABI from "./abi/Porridge.json"
import testhoneyABI from "./abi/TestHoney.json"
import ammABI from "./abi/AMM.json"
import { useAccount, useContractReads, useNetwork, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi"

export default function Borrowing() {

  const [displayString, setDisplayString] = useState<string>('')

  const [floorPrice, setFloorPrice] = useState<number>(0)
  const [locksBalance, setLocksBalance] = useState<number>(0)
  const [stakedBalance, setStakedBalance] = useState<number>(0)
  const [lockedBalance, setLockedBalance] = useState<number>(0)
  const [borrowedBalance, setBorrowedBalance] = useState<number>(0)
  
  const [borrow, setBorrow] = useState<number>(0)
  const debouncedBorrow = useDebounce(borrow, 1000)
  const [repay, setRepay] = useState<number>(0)
  const debouncedRepay = useDebounce(repay, 1000)
  
  const [honeyAllowance, setHoneyAllowance] = useState()

  const [borrowToggle, setBorrowToggle] = useState<boolean>(true)
  const [repayToggle, setRepayToggle] = useState<boolean>(false)

  const account = useAccount()
  const chain = useNetwork()

  const maxApproval: string = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

  const springs = useSpring({
    from: { x: -900 },
    to: { x: 0 },
  })

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        address: '0x461B8AdEDe13Aa786b3f14b05496B93c5148Ad51',
        abi: locksABI.abi,
        functionName: 'balanceOf',
        args: [account.address]
      },
      {
        address: '0x69B228b9247dF2c1F194f92fC19A340A9F2803f7',
        abi: porridgeABI.abi,
        functionName: 'getStaked',
        args: [account.address]
      },
      {
        address: '0x1b408d277D9f168A8893b1728d3B6cb75929a67d',
        abi: borrowABI.abi,
        functionName: 'getBorrowed',
        args: [account.address]
      },
      {
        address: '0x1b408d277D9f168A8893b1728d3B6cb75929a67d',
        abi: borrowABI.abi,
        functionName: 'getLocked',
        args: [account.address]
      },
      {
        address: '0x1b5F6509B8b4Dd5c9637C8fa6a120579bE33666F',
        abi: ammABI.abi,
        functionName: 'fsl'
      },
      {
        address: '0x1b5F6509B8b4Dd5c9637C8fa6a120579bE33666F',
        abi: ammABI.abi,
        functionName: 'supply'
      }
    ],
    onSettled(data: any) {
      if(!data[0]) {
        const button = document.getElementById('amm-button')
        if(button) {
          button.innerHTML = "error loading data"
        }
      }
      else {
        setFloorPrice((parseInt(data[4]._hex, 16) / Math.pow(10, 18)) / (parseInt(data[5]._hex, 16) / Math.pow(10, 18)))
        if(data[0]) {
          setLocksBalance(parseInt(data[0]._hex, 16) / Math.pow(10, 18))
        }
        if(data[1]) {
          setStakedBalance(parseInt(data[1]._hex, 16) / Math.pow(10, 18))
        }
        if(data[2]) {
          setBorrowedBalance(parseInt(data[2]._hex, 16) / Math.pow(10, 18))
        }
        if(data[3]) {
          setLockedBalance(parseInt(data[3]._hex, 16) / Math.pow(10, 18))
        }
      }
    }
  })

  // async function checkHoneyAllowance() {
  //   const provider = new ethers.providers.JsonRpcProvider(quickNodeFuji.rpcUrls[0])
  //   const testhoneyContractObject = new ethers.Contract(testhoneyAddy, testhoneyABI.abi, provider)
  //   const allowanceReq = await testhoneyContractObject.allowance(currentAccount, borrowAddy)
  //   setHoneyAllowance(parseInt(allowanceReq._hex, 16) / Math.pow(10, 18))
  //   return parseInt(allowanceReq._hex, 16) / Math.pow(10, 18)
  // }

  // async function approveHoneyInteraction() {
  //   const provider = new ethers.providers.Web3Provider(ethereum)
  //   const signer = provider.getSigner()
  //   const honeyContractObject = new ethers.Contract(testhoneyAddy, testhoneyABI.abi, signer)
  //   const approveTx = await honeyContractObject.approve(borrowAddy, ethers.utils.parseUnits(input.toString(), 18))
  //   approveTx.wait()
  // }

  function handlePill(action: number) {
    setDisplayString('')
    setBorrow(0)
    setRepay(0)
    if(action === 1) {
      setBorrowToggle(true)
      setRepayToggle(false)
    }
    if(action === 2) {
      setBorrowToggle(false)
      setRepayToggle(true)
    }
  }

  function handleTopChange(input: string) {
    setDisplayString(input)
    if(borrowToggle) {
      if(!input) {
        setBorrow(0)
      }
      else {
        setBorrow(parseFloat(input))
      }
    }
    if(repayToggle) {
      if(!input) {
        setRepay(0)
      }
      else {
        setRepay(parseFloat(input))
      }
    }
  }

  function handleTopInput() {
    if(borrowToggle) {
      return parseFloat(displayString)
    }
    if(repayToggle) {
      return parseFloat(displayString)
    }
  }

  async function handleButtonClick() {
    // if(!currentAccount) {
    //   connectWallet()
    // }
    // else if(!avaxChain) {
    //   switchToFuji()
    // }
    // else {
    //   if(borrowToggle) {
    //     borrowFunctionInteraction()
    //   }
    //   if(repayToggle) {
    //     if(honeyAllowance >= input) {
    //       repayFunctionInteraction()
    //     }
    //     else {
    //       const honeyAllowanceReq = await checkHoneyAllowance()
    //       if(honeyAllowanceReq >= input) {
    //         return
    //       }
    //       else {
    //         approveHoneyInteraction()
    //       }
    //     }
    //   }
    // }
  }

  function renderButton() {
    if(borrowToggle) {
      return 'borrow'
    }
    if(repayToggle) {
      return 'repay'
    }
  }

  function renderLabel() {
    if(borrowToggle) {
      return 'borrow'
    }
    if(repayToggle) {
      return 'repay'
    }
  }

  return (
    <div className="flex flex-row py-3">
      <animated.div className="w-[57%] flex flex-col pt-8 pb-2 px-24 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black" style={springs}>
        <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline">borrowing</h1>
        <div className="flex flex-row ml-2 items-center justify-between">
          <h3 className="font-acme text-[24px] ml-2">lock staked $locks and borrow $honey</h3>
          <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
            <div className={`font-acme w-20 py-2 ${borrowToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(1)}>borrow</div>
            <div className={`font-acme w-20 py-2 ${repayToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center rounded-r-2xl cursor-pointer`} onClick={() => handlePill(2)}>repay</div>
          </div>
        </div>
        <div className="flex flex-row mt-4 h-[100%] justify-between">
          <div className="flex flex-col h-[100%] w-[60%]">
            <div className="bg-white border-2 border-black rounded-xl h-[60%] relative">
            <h1 className="font-acme text-[40px] ml-10 mt-16">{renderLabel()}</h1>
              <div className="absolute top-[45%]">
                <input className="border-none focus:outline-none font-acme rounded-xl text-[40px] pl-10" placeholder="0" type="number" value={handleTopInput()} onChange={(e) => handleTopChange(e.target.value)} id="number-input" autoFocus />
              </div>
            </div>
            <div className="h-[15%] w-[80%] mx-auto mt-6">
              <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
            </div>
          </div>
          <div className="w-[35%] h-[70%] bg-white border-2 border-black rounded-xl flex flex-col px-6 py-10">
            <div className="flex flex-row justify-between items-center">
              <h1 className="font-acme text-[24px]">$LOCKS floor price:</h1>
              <p className="font-acme text-[20px]">{floorPrice > 0 ? `$${floorPrice.toFixed(2)}` : 0}</p>
            </div>
            <div className="flex flex-row justify-between items-center mt-6">
              <h1 className="font-acme text-[24px]">$LOCKS balance:</h1>
              <p className="font-acme text-[20px]">{locksBalance > 0 ? locksBalance.toFixed(2) : 0}</p>
            </div>
            <div className="flex flex-row justify-between items-center mt-6">
              <h1 className="font-acme text-[24px]">staked $LOCKS:</h1>
              <p className="font-acme text-[20px]">{stakedBalance ? stakedBalance.toFixed(2) : 0}</p>
            </div>
            <div className="flex flex-row justify-between items-center mt-6">
              <h1 className="font-acme text-[24px]">locked $LOCKS:</h1>
              <p className="font-acme text-[20px]">{lockedBalance > 0 ? lockedBalance.toFixed(2) : 0}</p>
            </div>
            <div className="flex flex-row justify-between items-center mt-6">
              <h1 className="font-acme text-[24px]">borrowed $HONEY:</h1>
              <p className="font-acme text-[20px]">{borrowedBalance > 0 ? borrowedBalance.toFixed(2) : 0}</p>
            </div>
          </div>
        </div>
      </animated.div>
      <Bear />
    </div>
  )
}