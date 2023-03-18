import React, { useEffect, useState } from "react"
import { ethers, BigNumber } from "ethers"
import { useSpring, config, animated } from "@react-spring/web"
import Bear from "./components/Bear"
import ammABI from "./abi/AMM.json"
import locksABI from "./abi/Locks.json"
import testhoneyABI from "./abi/TestHoney.json"
import { useAccount, useContractReads, useNetwork, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi"

export default function Amm() {

  const [displayString, setDisplayString] = useState<string>('')
  
  const [fsl, setFsl] = useState<number>(0)
  const [newFsl, setNewFsl] = useState<number>(0)
  const [psl, setPsl] = useState<number>(0)
  const [newPsl, setNewPsl] = useState<number>(0)
  const [floor, setFloor] = useState<number>(0)
  const [newFloor, setNewFloor] = useState<number>(0)
  const [supply, setSupply] = useState<number>(0)
  const [newSupply, setNewSupply] = useState<number>(0)
  const [targetRatio, setTargetRatio] = useState<number>(0)
  const [lastFloorRaise, setLastFloorRaise] = useState<string>("")  

  const [buy, setBuy] = useState<number>(0)
  const [sell, setSell] = useState<number>(0)
  const [redeem, setRedeem] = useState<number>(0)

  const [allowance, setAllowance] = useState<number>(0)
  
  const [buyToggle, setBuyToggle] = useState(true)
  const [sellToggle, setSellToggle] = useState(false)
  const [redeemToggle, setRedeemToggle] = useState(false)
  
  const [cost, setCost] = useState<number>(0)
  const [receive, setReceive] = useState<number>(0)
  const [redeemReceive, setRedeemReceive] = useState<number>(0)

  const account = useAccount()
  const chain = useNetwork()

  const formatAsPercentage = Intl.NumberFormat('default', {
    style: 'percent',
    maximumFractionDigits: 2
  })

  const maxApproval: string = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

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
        functionName: 'psl'
      },
      {
        address: '0x461B8AdEDe13Aa786b3f14b05496B93c5148Ad51',
        abi: locksABI.abi,
        functionName: 'totalSupply'
      },
      {
        address: '0x1b5F6509B8b4Dd5c9637C8fa6a120579bE33666F',
        abi: ammABI.abi,
        functionName: 'targetRatio'
      },
      {
        address: '0x1b5F6509B8b4Dd5c9637C8fa6a120579bE33666F',
        abi: ammABI.abi,
        functionName: 'lastFloorRaise'
      },
      {
        address: '0x29b9439E09d1D581892686D9e00E3481DCDD5f78',
        abi: testhoneyABI.abi,
        functionName: 'allowance',
        args: [account.address, '0x1b5F6509B8b4Dd5c9637C8fa6a120579bE33666F']
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
        let fslString = data[0].toBigInt().toString()
        let fslBeforeDecimalFloat = parseInt(fslString.slice(0, fslString.length - 18))
        setFsl(parseFloat(`${fslBeforeDecimalFloat}.${fslString.slice(fslString.length - 18, fslString.length - 16)}`))
        setNewFsl(parseFloat(`${fslBeforeDecimalFloat}.${fslString.slice(fslString.length - 18, fslString.length - 16)}`))
        let pslString = data[1].toBigInt().toString()
        let pslBeforeDecimalFloat = parseInt(pslString.slice(0, pslString.length - 18))
        setPsl(parseFloat(`${pslBeforeDecimalFloat}.${pslString.slice(pslString.length - 18, pslString.length - 16)}`))
        setNewPsl(parseFloat(`${pslBeforeDecimalFloat}.${pslString.slice(pslString.length - 18, pslString.length - 16)}`))
        let supplyString = data[2].toBigInt().toString()
        let supplyBeforeDecimalFloat = parseInt(supplyString.slice(0, supplyString.length - 18))
        setSupply(parseFloat(`${supplyBeforeDecimalFloat}.${supplyString.slice(supplyString.length - 18, supplyString.length - 16)}`))
        setNewSupply(parseFloat(`${supplyBeforeDecimalFloat}.${supplyString.slice(supplyString.length - 18, supplyString.length - 16)}`))
        setFloor(parseFloat(`${fslBeforeDecimalFloat}.${fslString.slice(fslString.length - 18, fslString.length - 16)}`) / parseFloat(`${supplyBeforeDecimalFloat}.${supplyString.slice(supplyString.length - 18, supplyString.length - 16)}`))
        setNewFloor(parseFloat(`${fslBeforeDecimalFloat}.${fslString.slice(fslString.length - 18, fslString.length - 16)}`) / parseFloat(`${supplyBeforeDecimalFloat}.${supplyString.slice(supplyString.length - 18, supplyString.length - 16)}`))
        setTargetRatio(data[3].toBigInt().toString() / Math.pow(10, 18))
        const date = new Date(parseInt(data[4].toBigInt().toString()) * 1000)
        setLastFloorRaise(date.toDateString())
        if(data[5]) {
          setAllowance(data[5].toBigInt().toString() / Math.pow(10, 18))
        }
      }
    }
  })

  const { config: buyConfig } = usePrepareContractWrite({
    address: '0x1b5F6509B8b4Dd5c9637C8fa6a120579bE33666F',
    abi: ammABI.abi,
    functionName: 'buy',
    args: [buy, buy],
    enabled: false,
    onSettled(data) {
      console.log('just settled buy prepare')
      console.log("data: ", data)
    }
  })
  const buyInteraction = useContractWrite(buyConfig)

  const { config: approveConfig } = usePrepareContractWrite({
    address: '0x29b9439E09d1D581892686D9e00E3481DCDD5f78',
    abi: testhoneyABI.abi,
    functionName: 'approve',
    args: ['0x1b5F6509B8b4Dd5c9637C8fa6a120579bE33666F', maxApproval],
    enabled: false
  })
  const { data: approveData, write: approveInteraction } = useContractWrite(approveConfig)
  const { isLoading: approveIsLoading, isSuccess: approveIsSuccess } = useWaitForTransaction({
    hash: approveData?.hash
  })

  useEffect(() => {
    if(approveData) {
      console.log('approveData exists and just changed')
      console.log(approveData)
    }
  }, [approveData?.hash])

  useEffect(() => {

  }, [])
  
  useEffect(() => {
    if(buy < 999) {
      simulateBuy()
    }
    else {
      setNewFloor(fsl / supply)
      setNewFsl(fsl)
      setNewPsl(psl)
      setNewSupply(supply)
      setCost(0)
    }
  }, [buy])

  useEffect(() => {
    if(sell <= supply) {
      simulateSell()
    }
    else {
      setNewFloor(fsl / supply)
      setNewFsl(fsl)
      setNewPsl(psl)
      setNewSupply(supply)
      setReceive(0)
    }
  }, [sell])

  useEffect(() => {
    if(redeem <= supply) {
      simulateRedeem()
    }
    else {
      setNewFloor(fsl / supply)
      setNewFsl(fsl)
      setNewSupply(supply)
      setRedeemReceive(0)
    }
  }, [redeem])

  const springs = useSpring({
    from: { x: -900 },
    to: { x: 0 },
  })

  function handlePill(action: number) {
    setDisplayString('')
    setBuy(0)
    setSell(0)
    setRedeem(0)
    if(action === 1) {
      setBuyToggle(true)
      setSellToggle(false)
      setRedeemToggle(false)
    }
    if(action === 2) {
      setBuyToggle(false)
      setSellToggle(true)
      setRedeemToggle(false)
    }
    if(action === 3) {
      setBuyToggle(false)
      setSellToggle(false)
      setRedeemToggle(true)
    }
  }
  
  function simulateBuy() {
    let _leftover = buy
    let _fsl = fsl
    let _psl = psl
    let _supply = supply
    let _purchasePrice = 0
    let _tax = 0
    let _market = 0
    let _floor = 0
    while(_leftover >= 1) {
      _market = marketPrice(_fsl, _psl, _supply)
      _floor = floorPrice(_fsl, _supply)
      _purchasePrice += _market
      _supply++
      if(_psl / _fsl >= 0.50) {
        _fsl += _market
      }
      else {
        _fsl += _floor
        _psl += (_market - _floor)
      }
      _leftover--
    }
    if(_leftover > 0) {
      _market = marketPrice(_fsl, _psl, _supply)
      _floor = floorPrice(_fsl, _supply)
      _purchasePrice += _market * _leftover
      _supply += _leftover
      if(_psl / _fsl >= 0.50) {
        _fsl += _market * _leftover
      }
      else {
        _psl += (_market - _floor) * _leftover
        _fsl += _floor * _leftover
      }
    }
    _tax = _purchasePrice * 0.003
    setNewFloor(floorPrice(_fsl + _tax, _supply))
    setNewFsl(_fsl + _tax)
    setNewPsl(_psl)
    setNewSupply(_supply)
    setCost(_purchasePrice + _tax)
    simulateFloorRaise()
  }
  
  function simulateSell() {
    let _leftover = sell
    let _fsl = fsl
    let _psl = psl
    let _supply = supply
    let _salePrice = 0
    let _tax = 0
    let _market = 0
    let _floor = 0
    while(_leftover >= 1) {
      _market = marketPrice(_fsl, _psl, _supply)
      _floor = floorPrice(_fsl, _supply) 
      _salePrice += _market
      _supply--
      _leftover--
      _fsl -= _floor
      _psl -= (_market - _floor)
    }
    if(_leftover > 0) {
      _market = marketPrice(_fsl, _psl, _supply)
      _floor = floorPrice(_fsl, _supply)
      _salePrice += _market * _leftover
      _psl -= (_market - _floor) * _leftover
      _fsl -= _floor * _leftover
      _supply -= _leftover
    }
    _tax = _salePrice * 0.053
    setNewFloor(floorPrice(_fsl, _supply))
    setNewFsl(_fsl + _tax)
    setNewPsl(_psl)
    setNewSupply(_supply)
    setReceive(_salePrice - _tax)
  }
  
  function simulateRedeem() {
    let rawTotal: number = redeem * floorPrice(fsl, supply)
    setRedeemReceive(rawTotal)
    setNewFsl(fsl - rawTotal)
    setNewSupply(supply - redeem)
    setNewFloor(floorPrice(newFsl, supply))
    simulateFloorRaise()
  }

  function simulateFloorRaise() {
    if(psl / fsl >= targetRatio) {
      let raiseAmount: number = (psl / fsl) * (psl / 32)
      setNewFsl((prev) => {
        return prev + raiseAmount
      })
      setNewPsl((prev) => {
        return prev - raiseAmount
      })
    }
  }
  
  function floorPrice(_fsl: number, _supply: number) {
    return _fsl / _supply
  }
  
  function marketPrice(_fsl: number, _psl: number, _supply: number) {
    return floorPrice(_fsl, _supply) + ((_psl / _supply) * ((_psl + _fsl) / _fsl)**5)
  }

  function handleTopLabel() {
    if(buyToggle) {
      return 'buy'
    }
    if(sellToggle) {
      return 'sell'
    }
    if(redeemToggle) {
      return 'redeem'
    }
  }
  
  function handleBottomLabel() {
    if(buyToggle) {
      return 'cost'
    }
    if(sellToggle) {
      return 'receive'
    }
    if(redeemToggle) {
      return 'receive'
    }
  }
  
  function renderButton() {
    if(buyToggle) {
      return 'buy'
    }
    if(sellToggle) {
      return 'sell'
    }
    if(redeemToggle) {
      return 'redeem'
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
      if(buyToggle) {
        if(button) {
          button.innerHTML = "buy"
        }
        if(cost > allowance) {
          if(button) {
            button.innerHTML = "approve"
          }
          approveInteraction?.()
        }
        // buyinteraction
      }
      if(sellToggle) {
        // sellinteraction
      }
      if(redeemToggle) {
        // redeeminteraction
      }
    }
  }
  
  function handleTopChange(input: string) {
    setDisplayString(input)
    if(buyToggle) {
      setBuy(parseFloat(input))
    }
    if(sellToggle) {
      setSell(parseFloat(input))
    }
    if(redeemToggle) {
      setRedeem(parseFloat(input))
    }
  }
  
  function handleTopInput() {
    if(buyToggle) {
      return parseFloat(displayString) > 999 ? '' : displayString
    }
    if(sellToggle) {
      return parseFloat(displayString) > supply ? '' : displayString
    }
    if(redeemToggle) {
      return parseFloat(displayString) > supply ? '' : displayString
    }
  }

  function handleBottomInput() {
    if(buyToggle) {
      if(!cost) {
        return 0
      }
      else {
        return cost.toLocaleString('en-US', { maximumFractionDigits: 2 })
      }
    }
    if(sellToggle) {
      if(!receive) {
        return 0
      }
      else {
        return receive.toLocaleString('en-US', { maximumFractionDigits: 2 })
      }
    }
    if(redeemToggle) {
      if(!redeemReceive) {
        return 0
      }
      else {
        return redeemReceive.toLocaleString('en-US', { maximumFractionDigits: 2 })
      }
    }
  }
    
    // async function buyFunctionInteraction() {
  //   const provider = new ethers.providers.Web3Provider(ethereum)
  //   const signer = provider.getSigner()
  //   const ammContractObjectSigner = new ethers.Contract(ammAddy, ammABI.abi, signer)
  //   const buyTx = await ammContractObjectSigner.buy(ethers.utils.parseUnits(buy, 18), ethers.utils.parseUnits("100000000", 18))
  //   buyTx.wait()
  // }

  // async function sellFunctionInteraction() {
    //   const provider = new ethers.providers.Web3Provider(ethereum)
    //   const signer = provider.getSigner()
  //   const ammContractObjectSigner = new ethers.Contract(ammAddy, ammABI.abi, signer)
  //   const sellTx = await ammContractObjectSigner.sell(ethers.utils.parseUnits(sell, 18))
  //   sellTx.wait()
  // }
  
  // async function redeemFunctionInteraction() {
    //   const provider = new ethers.providers.Web3Provider(ethereum)
    //   const signer = provider.getSigner()
    //   const ammContractObjectSigner = new ethers.Contract(ammAddy, ammABI.abi, signer)
  //   const redeemTx = await ammContractObjectSigner.redeem(ethers.utils.parseUnits(redeem, 18))
  //   redeemTx.wait()
  // }
  

  
  function test() {
    approveInteraction?.()
  }
  
  return (
    <div className="flex flex-row py-3 overflow-hidden">
      <animated.div className="w-[57%] flex flex-col pt-8 pb-2 px-24 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black" style={springs}>
        <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline">goldilocks AMM</h1>
        <div className="flex flex-row ml-2 items-center justify-between">
          <h3 className="font-acme text-[24px] ml-2">trading between $honey & $locks</h3>
          <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
            <div className={`font-acme w-20 py-2 ${buyToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(1)}>buy</div>
            <div className={`font-acme w-20 py-2 ${sellToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(2)}>sell</div>
            <div className={`font-acme w-20 py-2 ${redeemToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} onClick={() => handlePill(3)}>redeem</div>
          </div>
        </div>
        <div className="h-[75%] relative mt-4 flex flex-col">
          <div className="h-[67%] px-6">
            <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
              <div className="h-[50%]">
                <h1 className="font-acme text-[30px] px-6 my-2">{handleTopLabel()}</h1>
              </div>
              <div className="h-[50%] pl-10">
                <input className="border-none focus:outline-none font-acme rounded-xl text-[40px]" placeholder="0" value={handleTopInput()} onChange={(e) => handleTopChange(e.target.value)} type="number" id="number-input" autoFocus />
              </div>
            </div>
            <div className="absolute top-[31%] left-[50%] h-10 w-10 bg-[#ffff00] border-2 border-black rounded-3xl flex justify-center items-center" onClick={() => test()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D111C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
            </div>
            <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
              <div className="h-[50%]">
                <h1 className="font-acme text-[30px] px-6 my-2">{handleBottomLabel()}</h1>
              </div>
              <div className="h-[50%] pl-10">
                <h1 className="font-acme text-[40px]">{handleBottomInput()}</h1>
              </div>
            </div>
          </div>
          <div className="h-[33%] w-[100%] flex justify-center items-center">
            <button className="h-[50%] w-[50%] bg-white rounded-xl py-3 px-6 border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row w-[55%] px-3 ml-3 justify-between rounded-xl border-2 border-black mt-2  bg-white">
            <div className="flex flex-col items-start justify-between">
              <h1 className="font-acme text-[24px]">$LOCKS floor price:</h1>
              <p className="font-acme text-[24px]">current fsl:</p>
              <p className="font-acme text-[24px]">current psl:</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <p className="font-acme text-[20px]">${ floor > 0 ? floor.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
              <p className="font-acme text-[20px]">{ fsl > 0 ? fsl.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-" }</p>
              <p className="font-acme text-[20px]">{ psl > 0 ? psl.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-" }</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <p className={`${floor > newFloor ? "text-red-600" : floor == newFloor ? "" : "text-green-600"} font-acme text-[20px]`}>${ buy > 0 || sell > 0 || redeem > 0 ? newFloor.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
              <p className={`${fsl > newFsl ? "text-red-600" : fsl == newFsl ? "" : "text-green-600"} font-acme text-[20px]`}>{ fsl == newFsl ? "-" : newFsl.toLocaleString('en-US', { maximumFractionDigits: 2 }) }</p>
              <p className={`${psl > newPsl ? "text-red-600" : psl == newPsl ? "" : "text-green-600"} font-acme text-[20px]`}>{ buy > 0 || sell > 0 || redeem > 0 ? newPsl.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
            </div>
          </div>
          <div className="flex flex-row w-[40%] px-3 justify-between mr-3 rounded-xl border-2 border-black mt-2 bg-white">
            <div className="flex flex-col items-start justify-between w-[40%]">
              <h1 className="font-acme text-[20px]">$LOCKS supply:</h1>
              <p className="font-acme text-[20px]">target ratio:</p>
              <p className="font-acme text-[20px]">last floor raise:</p>
            </div>
            <div className="flex flex-col items-end justify-between w-[30%]">
              <p className="font-acme text-[20px]">{ supply > 0 ? supply.toLocaleString('en-US') : "-" }</p>
              <p className="font-acme text-[20px] text-white">1,044</p>
              <p className="font-acme text-[20px] text-white">1,044</p>
            </div>
            <div className="flex flex-col items-end justify-between w-[30%]">
              <p className={`${supply > newSupply ? "text-red-600" : supply == newSupply ? "" : "text-green-600"} font-acme text-[20px]`}>{ supply == newSupply ? "-" : newSupply.toLocaleString('en-US') }</p>
              <p className="font-acme text-[20px]">{ targetRatio > 0 ? formatAsPercentage.format(targetRatio) : "-" }</p>
              <p className="font-acme text-[20px] whitespace-nowrap">{lastFloorRaise}</p>
            </div>
          </div>
        </div>
      </animated.div>
      <Bear />
    </div>
  )
}