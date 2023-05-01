import React, { useEffect, useState } from "react"
import { ethers, BigNumber } from "ethers"
import { useSpring, animated } from "@react-spring/web"
import useDebounce from "../hooks/useDebounce"
import Bear from "../components/Bear"
import porridgeABI from "../utils/abi/Porridge.json"
import locksABI from "../utils/abi/Locks.json"
import testhoneyABI from "../utils/abi/TestHoney.json"
import ammABI from "../utils/abi/AMM.json"
import { useAccount, useContractReads, useNetwork, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi"

export default function Staking() {

  const [initialRender, setInitialRender] = useState<boolean>(false)

  const [displayString, setDisplayString] = useState<string>('')
  
  const [floorPrice, setFloorPrice] = useState<number>(0)
  const [locksBalance, setLocksBalance] = useState<number>(0)
  const [stakedBalance, setStakedBalance] = useState<number>(0)
  const [honeyBalance, setHoneyBalance] = useState<number>(0)
  const [porridgeBalance, setPorridgeBalance] = useState<number>(0)
  const [claimBalance, setClaimBalance] = useState<number>(0)
  
  const [stake, setStake] = useState<number>(0)
  const debouncedStake = useDebounce(stake, 1000)
  const [unstake, setUnstake] = useState<number>(0)
  const debouncedUnstake = useDebounce(unstake, 1000)
  const [realize, setRealize] = useState<number>(0)
  const debouncedRealize = useDebounce(realize, 1000)

  const [locksAllowance, setLocksAllowance] = useState<number>(0)
  const [testhoneyAllowance, setTestHoneyAllowance] = useState<number>(0)
  
  const [stakeToggle, setStakeToggle] = useState<boolean>(true)
  const [unstakeToggle, setUnstakeToggle] = useState<boolean>(false)
  const [realizeToggle, setRealizeToggle] = useState<boolean>(false)

  const [popupToggle, setPopupToggle] = useState<boolean>(false)

  const account = useAccount()
  const chain = useNetwork()

  const maxApproval: string = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
  
  const springs = useSpring({
    from: { x: -900 },
    to: { x: 0 },
  })

  useEffect(() => {
    setInitialRender(true)
  }, [])

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        address: '0x1b5F6509B8b4Dd5c9637C8fa6a120579bE33666F',
        abi: ammABI.abi,
        functionName: 'fsl'
      },
      {
        address: '0x1b5F6509B8b4Dd5c9637C8fa6a120579bE33666F',
        abi: ammABI.abi,
        functionName: 'supply'
      },
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
        address: '0x69B228b9247dF2c1F194f92fC19A340A9F2803f7',
        abi: porridgeABI.abi,
        functionName: 'balanceOf',
        args: [account.address]
      },
      {
        address: '0x69B228b9247dF2c1F194f92fC19A340A9F2803f7',
        abi: porridgeABI.abi,
        functionName: '_calculateYield',
        args: [account.address]
      },
      {
        address: '0x461B8AdEDe13Aa786b3f14b05496B93c5148Ad51',
        abi: locksABI.abi,
        functionName: 'allowance',
        args: [account.address, '0x69B228b9247dF2c1F194f92fC19A340A9F2803f7']
      },
      {
        address: '0x29b9439E09d1D581892686D9e00E3481DCDD5f78',
        abi: testhoneyABI.abi,
        functionName: 'allowance',
        args: [account.address, '0x69B228b9247dF2c1F194f92fC19A340A9F2803f7']
      },
      {
        address: '0x29b9439E09d1D581892686D9e00E3481DCDD5f78',
        abi: testhoneyABI.abi,
        functionName: 'balanceOf',
        args: [account.address]
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
        setFloorPrice((parseInt(data[0]._hex, 16) / Math.pow(10, 18)) / (parseInt(data[1]._hex, 16) / Math.pow(10, 18)))
        if(data[2]) {
          setLocksBalance(parseInt(data[2]._hex, 16) / Math.pow(10, 18))
        }
        if(data[3]) {
          setStakedBalance(parseInt(data[3]._hex, 16) / Math.pow(10, 18))
        }
        if(data[4]) {
          setPorridgeBalance(parseInt(data[4]._hex, 16) / Math.pow(10, 18))
        }
        if(data[5]) {
          setClaimBalance(parseInt(data[5]._hex, 16) / Math.pow(10, 18))
        }
        if(data[6]) {
          setLocksAllowance(parseInt(data[6]._hex, 16) / Math.pow(10, 18))
        }
        if(data[7]) {
          setTestHoneyAllowance(parseInt(data[7]._hex, 16) / Math.pow(10, 18))
        }
        if(data[8]) {
          setHoneyBalance(parseInt(data[8]._hex, 16) / Math.pow(10, 18))
        }
      }
    }
  })

  const { config: locksApproveConfig } = usePrepareContractWrite({
    address: '0x461B8AdEDe13Aa786b3f14b05496B93c5148Ad51',
    abi: locksABI.abi,
    functionName: 'approve',
    args: ['0x69B228b9247dF2c1F194f92fC19A340A9F2803f7', maxApproval],
    enabled: true,
    onSettled() {
      console.log('just settled locksApprove')
    }
  })
  const { data: locksApproveData, write: locksApproveInteraction } = useContractWrite(locksApproveConfig)
  const { isLoading: locksApproveIsLoading, isSuccess: locksApproveIsSuccess } = useWaitForTransaction({
    hash: locksApproveData?.hash
  })

  const { config: testhoneyApproveConfig } = usePrepareContractWrite({
    address: '0x29b9439E09d1D581892686D9e00E3481DCDD5f78',
    abi: testhoneyABI.abi,
    functionName: 'approve',
    args: ['0x69B228b9247dF2c1F194f92fC19A340A9F2803f7', maxApproval],
    enabled: true,
    onSettled() {
      console.log('just settled testhoneyApprove')
    }
  })
  const { data: testhoneyApproveData, write: testhoneyApproveInteraction } = useContractWrite(testhoneyApproveConfig)
  const { isLoading: testhoneyApproveIsLoading, isSuccess: testhoneyApproveIsSuccess} = useWaitForTransaction({
    hash: testhoneyApproveData?.hash
  })

  const { config: stakeConfig } = usePrepareContractWrite({
    address: '0x69B228b9247dF2c1F194f92fC19A340A9F2803f7',
    abi: porridgeABI.abi,
    functionName: 'stake',
    args: [BigNumber.from(ethers.utils.parseUnits(debouncedStake.toString(), 18))],
    enabled: false,
    // enabled: Boolean(debouncedStake),
    onSettled() {
      console.log('just settled stake')
      console.log('debouncedStake: ', debouncedStake)
    }
  })
  const { data: stakeData, write: stakeInteraction } = useContractWrite(stakeConfig)
  const { isLoading: stakeIsLoading, isSuccess: stakeIsSuccess } = useWaitForTransaction({
    hash: stakeData?.hash
  })

  const {config: unstakeConfig } = usePrepareContractWrite({
    address: '0x69B228b9247dF2c1F194f92fC19A340A9F2803f7',
    abi: porridgeABI.abi,
    functionName: 'unstake',
    args: [BigNumber.from(ethers.utils.parseUnits(debouncedUnstake.toString(), 18))],
    enabled: false,
    // enabled: Boolean(debouncedUnstake),
    onSettled() {
      console.log('just settled unstake')
      console.log('debouncedUnstake: ', debouncedUnstake)
    }
  })
  const { data: unstakeData, write: unstakeInteraction } = useContractWrite(unstakeConfig)
  const { isLoading: unstakeIsLoading, isSuccess: unstakeIsSuccess } = useWaitForTransaction({
    hash: unstakeData?.hash
  })

  const { config: realizeConfig } = usePrepareContractWrite({
    address: '0x69B228b9247dF2c1F194f92fC19A340A9F2803f7',
    abi: porridgeABI.abi,
    functionName: 'realize',
    args: [BigNumber.from(ethers.utils.parseUnits(debouncedRealize.toString(), 18))],
    enabled: Boolean(debouncedRealize),
    onSettled() {
      console.log('just settled realize')
      console.log('debouncedRealize: ', debouncedRealize)
    }
  })
  const { data: realizeData, write: realizeInteraction } = useContractWrite(realizeConfig)
  const { isLoading: realizeIsLoading, isSuccess: realizeIsSuccess } = useWaitForTransaction({
    hash: realizeData?.hash
  })

  const { config: claimConfig } = usePrepareContractWrite({
    address: '0x69B228b9247dF2c1F194f92fC19A340A9F2803f7',
    abi: porridgeABI.abi,
    functionName: 'claim',
    enabled: true,
    onSettled() {
      console.log('just settled claim')
    }
  })
  const { data: claimData, write: claimInteraction } = useContractWrite(claimConfig)
  const { isLoading: claimIsLoading, isSuccess: claimIsSuccess } = useWaitForTransaction({
    hash: claimData?.hash
  })

  function test() {
    console.log('hello')
  }

  function handlePill(action: number) {
    setDisplayString('')
    setStake(0)
    setUnstake(0)
    setRealize(0)
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

  function handleTopChange(input: string) {
    setDisplayString(input)
    if(stakeToggle) {
      if(!input) {
        setStake(0)
      }
      else {
        setStake(parseFloat(input))
      }
    }
    if(unstakeToggle) {
      if(!input) {
        setUnstake(0)
      }
      else {
        setUnstake(parseFloat(input))
      }
    }
    if(realizeToggle) {
      if(!input) {
        setRealize(0)
      }
      else {
        setRealize(parseFloat(input))
      }
    }
  }

  function handleTopInput() {
    if(stakeToggle) {
      return parseFloat(displayString) >= locksBalance ? '' : displayString
    }
    if(unstakeToggle) {
      return parseFloat(displayString) >= stakedBalance ? '' : displayString
    }
    if(realizeToggle) {
      return parseFloat(displayString) >= porridgeBalance ? '' : displayString
    }
  }

  async function handleButtonClick() {
    const button = document.getElementById('amm-button')
    if(!account.isConnected) {
      if(button) {
        button.innerHTML = "connect wallet"
      }
    }
    else if(chain?.chain?.id !== 43113) {
      if(button) {
        button.innerHTML = "switch to fuji plz"
      }
    }
    else {
      if(stakeToggle) {
        if(button) {
          button.innerHTML = "stake"
        }
        if(stake > locksAllowance) {
          if(button) {
            button.innerHTML = "approve locks"
          }
          locksApproveInteraction?.()
        }
        else {
          stakeInteraction?.()
        }
      }
      if(unstakeToggle) {
        if(button) {
          button.innerHTML = "unstake"
        }
        unstakeInteraction?.()
      }
      if(realizeToggle) {
        if(button) {
          button.innerHTML = "realize"
        }
        if(realize * floorPrice > testhoneyAllowance) {
          if(button) {
            button.innerHTML = "approve honey"
          }
          testhoneyApproveInteraction?.()
        }
        else {
          realizeInteraction?.()
        }
      }
    }
  }
  

  function renderButton() {
    if(claimIsLoading) {
      return 'claiming...'
    }
    if(stakeToggle) {
      if(locksApproveIsLoading) {
        return 'approving locks...'
      }
      if(stakeIsLoading) {
        return 'staking...'
      }
      return 'stake'
    }
    if(unstakeToggle) {
      if(unstakeIsLoading) {
        return 'unstaking...'
      }
      return 'unstake'
    }
    if(realizeToggle) {
      if(testhoneyApproveIsLoading) {
        return 'approving honey...'
      }
      if(realizeIsLoading) {
        return 'stirring...'
      }
      return 'stir'
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
      return 'stir'
    }
  }

  function handleBalance() {
    if(stakeToggle) {
      return locksBalance > 0 ? locksBalance.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.0"
    }
    if(unstakeToggle) {
      return stakedBalance > 0 ? stakedBalance.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.0"
    }
    if(realizeToggle) {
      return porridgeBalance > 0 ? porridgeBalance.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.0"
    }
  }

  function handlePercentageButtons(action: number) {
    if(action == 1) {
      if(stakeToggle) {
        setDisplayString((locksBalance / 4).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setStake(locksBalance / 4)
      }
      if(unstakeToggle) {
        setDisplayString((stakedBalance / 4).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setUnstake(stakedBalance / 4)
      }
      if(realizeToggle) {
        setDisplayString((porridgeBalance / 4).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setRealize(porridgeBalance / 4)
      }
    }
    if(action == 2) {
      if(stakeToggle) {
        setDisplayString((locksBalance / 2).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setStake(locksBalance / 2)
      }
      if(unstakeToggle) {
        setDisplayString((stakedBalance / 2).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setUnstake(stakedBalance / 2)
      }
      if(realizeToggle) {
        setDisplayString((porridgeBalance / 2).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setRealize(porridgeBalance / 2)
      }
    }
    if(action == 3) {
      if(stakeToggle) {
        setDisplayString((locksBalance * 0.75).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setStake(locksBalance * 0.75)
      }
      if(unstakeToggle) {
        setDisplayString((stakedBalance * 0.75).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setUnstake(stakedBalance * 0.75)
      }
      if(realizeToggle) {
        setDisplayString((porridgeBalance * 0.75).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setRealize(porridgeBalance * 0.75)
      }
    }
    if(action == 4) {
      if(stakeToggle) {
        setDisplayString(locksBalance.toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setStake(locksBalance)
      }
      if(unstakeToggle) {
        setDisplayString(stakedBalance.toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setUnstake(stakedBalance)
      }
      if(realizeToggle) {
        setDisplayString(porridgeBalance.toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setRealize(porridgeBalance)
      }
    }
  }

  if(!initialRender) {
    return null
  }
  else {
    return (
      <div className="flex flex-row py-3">
        <animated.div className="w-[57%] flex flex-col pt-8 pb-2 px-16 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black" style={springs}>
          { popupToggle && 
            <div className="z-10 bg-white rounded-xl border-2 border-black w-36 h-36 left-[60%] top-[30%] absolute px-4">
              <span className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer" onClick={() => setPopupToggle(false)}>x</span>
              <p className="mt-10 mx-auto font-acme">burn n porridge to buy n locks at floor price</p>
            </div>
          }
          <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline" onClick={() => test()}>staking</h1>
          <div className="flex flex-row ml-2 items-center justify-between">
            <h3 className="font-acme text-[24px] ml-2">staking $locks for $porridge</h3>
            <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
              <div className={`font-acme w-20 py-2 ${stakeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(1)}>stake</div>
              <div className={`font-acme w-20 py-2 ${unstakeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(2)}>unstake</div>
              <div className={`font-acme w-20 py-2 ${realizeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} onClick={() => handlePill(3)}>stir <span className="ml-1 rounded-full px-2 border-2 border-black hover:bg-black hover:text-white" onClick={() => setPopupToggle(true)}>?</span></div>
            </div>
          </div>
          <div className="h-[100%] mt-4 flex flex-row">
            <div className="w-[60%] flex flex-col">
              <div className="rounded-3xl border-2 border-black w-[100%] h-[60%] bg-white flex flex-col relative">
                <div className="flex flex-row items-center justify-between ml-10 mt-16">
                  <h1 className="font-acme text-[40px]">{renderLabel()}</h1>
                  <div className="flex flex-row items-center mr-6">
                    <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(1)}>25%</button>
                    <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(2)}>50%</button>
                    <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(3)}>75%</button>
                    <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(4)}>MAX</button>
                  </div>
                </div>
                <div className="absolute top-[45%]">
                  <input className="border-none focus:outline-none font-acme rounded-xl text-[40px] pl-10" placeholder="0" type="number" value={handleTopInput()} onChange={(e) => handleTopChange(e.target.value)} id="number-input" autoFocus />
                </div>
                <div className="absolute right-0 bottom-[35%]">
                  <h1 className="text-[23px] mr-6 font-acme text-[#878d97]">balance: {handleBalance()}</h1>
                </div>
              </div>
              <div className="h-[15%] w-[80%] mx-auto mt-6">
                <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
              </div>
            </div>
            <div className="flex flex-col w-[40%] h-[100%] mt-4 ml-4">
              <div className="w-[100%] h-[70%] flex p-6 flex-col bg-white rounded-xl border-2 border-black">
                <div className="flex flex-row justify-between items-center mt-3">
                  <h1 className="font-acme text-[24px]">$LOCKS floor price:</h1>
                  <p className="font-acme text-[20px]">${floorPrice > 0 ? floorPrice.toLocaleString('en-US', { maximumFractionDigits: 4 }) : 0}</p>
                </div>
                <div className="flex flex-row justify-between items-center mt-3">
                  <h1 className="font-acme text-[24px]">$LOCKS balance:</h1>
                  <p className="font-acme text-[20px]">{locksBalance > 0 ? locksBalance.toLocaleString('en-US', { maximumFractionDigits: 4 }) : 0}</p>
                </div>
                <div className="flex flex-row justify-between items-center mt-3">
                  <h1 className="font-acme text-[24px]">$HONEY balance:</h1>
                  <p className="font-acme text-[20px]">{honeyBalance > 0 ? honeyBalance.toLocaleString('en-US', { maximumFractionDigits: 4 }) : 0}</p>
                </div>
                <div className="flex flex-row justify-between items-center mt-3">
                  <h1 className="font-acme text-[24px]">staked $LOCKS:</h1>
                  <p className="font-acme text-[20px]">{stakedBalance > 0 ? stakedBalance.toLocaleString('en-US', { maximumFractionDigits: 4 }) : 0}</p>
                </div>
                <div className="flex flex-row justify-between items-center mt-3">
                  <h1 className="font-acme text-[24px]">$PRG balance:</h1>
                  <p className="font-acme text-[20px]">{porridgeBalance > 0 ? porridgeBalance.toLocaleString('en-US', { maximumFractionDigits: 4 }) : 0}</p>
                </div>
                <div className="flex flex-row justify-between items-center mt-3">
                  <h1 className="font-acme text-[24px]">$PRG available to claim:</h1>
                  <p className="font-acme text-[20px]">{claimBalance > 0 ? claimBalance.toLocaleString('en-US', { maximumFractionDigits: 4 }) : 0}</p>
                </div>
              </div>
              {account.isConnected && <div className="h-[10%] w-[70%] mx-auto mt-4">
                <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[25px]" id="amm-button" onClick={() => claimInteraction?.()} >claim yield</button>
              </div>}
            </div>
          </div>
        </animated.div>
        <Bear />
      </div>
    )
  }
}