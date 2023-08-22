"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { formatEther } from "viem"
import { useWallet } from ".."
import { useDebounce, useGammMath } from "../../hooks/gamm"
import { getContract, getPublicClient } from "@wagmi/core"
import { contracts } from "../../utils/addressi"
import { GammInitialState, GammInfo, NewInfo, Slippage } from "../../utils/interfaces"

const INITIAL_STATE: GammInitialState = {
  gammInfo: {
    fsl: 0,
    psl: 0,
    supply: 0,
    targetRatio: 0,
    lastFloorRaise: 0,
    honeyAmmAllowance: 0
  },
  newInfo: {
    fsl: 0,
    psl: 0,
    floor: 0,
    market: 0,
    supply: 0
  },
  slippage: {
    amount: 0.1,
    toggle: false,
    displayString: '0.1'
  },

  honeyBuy: 0,
  sellingLocks: 0,
  redeemingLocks: 0,

  setHoneyBuy: (_honeyBuy: number) => {},
  setBuyingLocks: (_buyingLocks: number) => {},
  setSellingLocks: (_sellingLocks: number) => {},
  setGettingHoney: (_gettingHoney: number) => {},
  setRedeemingHoney: (_redeemingHoney: number) => {},
  setRedeemingLocks: (_redeemingLocks: number) => {},
  setDisplayString: (_displayString: string) => {},
  setBottomDisplayString: (_bottomDisplayString: string) => {},

  buyingLocks: 0,
  gettingHoney: 0,
  redeemingHoney: 0,

  topInputFlag: false,
  bottomInputFlag: false,
  setTopInputFlag: (_bool: boolean) => {},
  setBottomInputFlag: (_bool: boolean) => {},

  changeSlippage: (_amount: number, _displayString: string) => {},
  changeSlippageToggle: (_toggle: boolean) => {},
  checkSlippageAmount: () => {},

  activeToggle: 'buy',
  changeActiveToggle: (_toggle: string) => {},

  displayString: '',
  bottomDisplayString: '',

  changeNewInfo: (_fsl: number, _psl: number, _floor: number, _market: number, _supply: number) => {},

  simulateBuy: (_amt: number) => {},
  simulateSell: (_amt: number) => {},
  simulateRedeem: (_amt: number) => {},

  handlePercentageButtons: (_action: number) => {},

  flipTokens: () => {},

  handleTopInput: (): string => '',
  handleTopChange: (_input: string) => {},
  handleTopBalance: (): string => "0.00",

  handleBottomInput: (): string => '',
  handleBottomChange: (_input: string) => {},
  handleBottomBalance: (): string => "0.00",

  debouncedHoneyBuy: 0,
  debouncedGettingHoney: 0,

  findLocksBuyAmount: (_debouncedValue: number) => 0,
  findLocksSellAmount: (_debouncedValue: number) => 0,

  refreshGammInfo: async () => {},
  refreshChartInfo: async () => {},
}

const GammContext = createContext(INITIAL_STATE)

export const GammProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { balance, wallet, isConnected } = useWallet()
  const { simulateBuyDry, simulateSellDry, floorPrice, marketPrice } = useGammMath()

  const [gammInfoState, setGammInfoState] = useState<GammInfo>(INITIAL_STATE.gammInfo)
  const [newInfoState, setNewInfoState] = useState<NewInfo>(INITIAL_STATE.newInfo)
  const [slippageState, setSlippageState] = useState<Slippage>(INITIAL_STATE.slippage)
  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)

  const [displayStringState, setDisplayStringState] = useState<string>(INITIAL_STATE.displayString)
  const [bottomDisplayStringState, setBottomDisplayStringState] = useState<string>(INITIAL_STATE.bottomDisplayString)

  const [honeyBuyState, setHoneyBuyState] = useState<number>(INITIAL_STATE.honeyBuy)
  const debouncedHoneyBuyState = useDebounce(honeyBuyState, 1000)
  const [sellingLocksState, setSellingLocksState] = useState<number>(INITIAL_STATE.sellingLocks)
  const [redeemingLocksState, setRedeemingLocksState] = useState<number>(INITIAL_STATE.redeemingLocks)

  const [buyingLocksState, setBuyingLocksState] = useState<number>(INITIAL_STATE.buyingLocks)
  const [gettingHoneyState, setGettingHoneyState] = useState<number>(INITIAL_STATE.gettingHoney)
  const debouncedGettingHoneyState = useDebounce(gettingHoneyState, 1000)
  const [redeemingHoneyState, setRedeemingHoneyState] = useState<number>(INITIAL_STATE.redeemingHoney)

  const [topInputFlagState, setTopInputFlagState] = useState<boolean>(INITIAL_STATE.topInputFlag)
  const [bottomInputFlagState, setBottomInputFlagState] = useState<boolean>(INITIAL_STATE.bottomInputFlag)

  const publicClient = getPublicClient()

  const honeyContract = getContract({
    address: contracts.honey.address as `0x${string}`,
    abi: contracts.honey.abi
  })
  
  const gammContract = getContract({
    address: contracts.gamm.address as `0x${string}`,
    abi: contracts.gamm.abi
  })

  const changeSlippage = (amount: number, displayString: string) => {
    const updatedState = { ...slippageState }
    updatedState.amount = amount
    updatedState.displayString = displayString
    setSlippageState(updatedState)
    localStorage.setItem('slippageAmount', amount.toString())
  }

  const changeSlippageToggle = (toggle: boolean) => {
    const updatedState = { ...slippageState }
    updatedState.toggle = toggle
    setSlippageState(updatedState)
  }

  const changeActiveToggle = (toggle: string) => {
    setDisplayStringState('')
    setBottomDisplayStringState('')
    setHoneyBuyState(0)
    setBuyingLocksState(0)
    setSellingLocksState(0)
    setGettingHoneyState(0)
    setRedeemingLocksState(0)
    setRedeemingHoneyState(0)
    setActiveToggleState(toggle)
  }

  const flipTokens = () => {
    if(activeToggleState === 'redeem') {
      return
    }
    setDisplayStringState('')
    setBottomDisplayStringState('')
    setHoneyBuyState(0)
    setBuyingLocksState(0)
    setSellingLocksState(0)
    setGettingHoneyState(0)
    if(activeToggleState === 'buy') {
      setActiveToggleState('sell')
    }
    else if(activeToggleState === 'sell') {
      setActiveToggleState('buy')
    }
  }

  const changeNewInfo = (fsl: number, psl: number, floor: number, market: number, supply: number) => {
    setNewInfoState({
      fsl: fsl,
      psl: psl,
      floor: floor,
      market: market,
      supply: supply
    })
  }

  const handlePercentageButtons = (action: number) => {
    if(action == 1) {
      if(activeToggleState === 'buy') {
        setDisplayStringState((balance.honey / 4).toFixed(4))
        setHoneyBuyState(balance.honey / 4)
      }
      if(activeToggleState === 'sell') {
        setDisplayStringState((balance.locks / 4).toFixed(4))
        setSellingLocksState(balance.locks / 4)
      }
      if(activeToggleState === 'redeem') {
        setDisplayStringState((balance.locks / 4).toFixed(4))
        setRedeemingLocksState(balance.locks / 4)
      }
    }
    if(action == 2) {
      if(activeToggleState === 'buy') {
        setDisplayStringState((balance.honey / 2).toFixed(4))
        setHoneyBuyState(balance.honey / 2)
      }
      if(activeToggleState === 'sell') {
        setDisplayStringState((balance.locks / 2).toFixed(4))
        setSellingLocksState(balance.locks / 2)
      }
      if(activeToggleState === 'redeem') {
        setDisplayStringState((balance.locks / 2).toFixed(4))
        setRedeemingLocksState(balance.locks / 2)
      }
    }
    if(action == 3) {
      if(activeToggleState === 'buy') {
        setDisplayStringState((balance.honey * 0.75).toFixed(4))
        setHoneyBuyState(balance.honey * 0.75)
      }
      if(activeToggleState === 'sell') {
        setDisplayStringState((balance.locks * 0.75).toFixed(4))
        setSellingLocksState(balance.locks * 0.75)
      }
      if(activeToggleState === 'redeem') {
        setDisplayStringState((balance.locks * 0.75).toFixed(4))
        setRedeemingLocksState(balance.locks * 0.75)
      }
    }
    if(action == 4) {
      if(activeToggleState === 'buy') {
        setDisplayStringState(balance.honey.toFixed(4))
        setHoneyBuyState(balance.honey)
      }
      if(activeToggleState === 'sell') {
        setDisplayStringState(balance.locks.toFixed(4))
        setSellingLocksState(balance.locks)
      }
      if(activeToggleState === 'redeem') {
        setDisplayStringState(balance.locks.toFixed(4))
        setRedeemingLocksState(balance.locks)
      }
    }
  }

  const findLocksBuyAmount = (debouncedValue: number) => {
    const honey: number = debouncedValue
    let locks: number = honey / marketPrice(gammInfoState.fsl, gammInfoState.psl, gammInfoState.supply)
    let temp: number = 0
    while(parseFloat(temp.toFixed(2)) !== parseFloat(honey.toFixed(2))) {
      temp = simulateBuyDry(locks, gammInfoState.fsl, gammInfoState.psl, gammInfoState.supply)
      if(parseFloat(temp.toFixed(2)) > parseFloat(honey.toFixed(2))) {
        const diff = temp - honey
        if(diff > 100) {
          locks -= 0.01
        }
        else if(diff > 10) {
          locks -= 0.001
        }
        else {
          locks -= 0.0000001
        }
      }
      else if(parseFloat(temp.toFixed(2)) < parseFloat(honey.toFixed(2))) {
        const diff = honey - temp
        if(diff > 100) {
          locks += 0.01
        }
        else if(diff > 10) {
          locks += 0.001
        }
        else {
          locks += 0.0000001
        }
      }
      else {
        const locksWithSlippage: number = locks * (1 - (slippageState.amount / 100))
        setBuyingLocksState(locksWithSlippage)
        setBottomDisplayStringState(locksWithSlippage.toFixed(4))
        console.log('found it: ', parseFloat(temp.toFixed(2)))
        console.log('locks: ', locks)
        console.log('with slippage: ', locksWithSlippage)
      }
    }
    return locks * (1 - (slippageState.amount / 100))
  }

  const findLocksSellAmount = (debouncedValue: number) => {
    const honey: number = debouncedValue
    let locks: number = honey / marketPrice(gammInfoState.fsl, gammInfoState.psl, gammInfoState.supply)
    let temp: number = 0
    while(parseFloat(temp.toFixed(2)) !== parseFloat(honey.toFixed(2))) {
      temp = simulateSellDry(locks, gammInfoState.fsl, gammInfoState.psl, gammInfoState.supply)
      if(parseFloat(temp.toFixed(2)) > parseFloat(honey.toFixed(2))) {
        const diff = temp - honey
        if(diff > 100) {
          locks -= 0.01
        }
        else if(diff > 10) {
          locks -= 0.001
        }
        else {
          locks -= 0.0000001
        }
      }
      else if(parseFloat(temp.toFixed(2)) < parseFloat(honey.toFixed(2))) {
        const diff = honey - temp
        if(diff > 100) {
          locks += 0.01
        }
        else if(diff > 10) {
          locks += 0.001
        }
        else {
          locks += 0.0000001
        }
      }
    }
    return locks
  }

  const simulateBuy = (amt: number) => {
    let _leftover = amt
    let _fsl = gammInfoState.fsl
    let _psl = gammInfoState.psl
    let _supply = gammInfoState.supply
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

    const response = {
      fsl: _fsl,
      psl: _psl,
      floor: floorPrice(_fsl + _tax, _supply),
      market: marketPrice(_fsl + _tax, _psl, _supply),
      supply: _supply
    }

    setNewInfoState(response)
    simulateFloorRaise(_fsl + _tax, _psl, _supply)
  }

  const simulateSell = (amt: number) => {
    let _leftover = amt
    let _fsl = gammInfoState.fsl
    let _psl = gammInfoState.psl
    let _supply = gammInfoState.supply
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

    const response = {
      fsl: _fsl + _tax,
      psl: _psl,
      floor: floorPrice(_fsl + _tax, _supply),
      market: marketPrice(_fsl + _tax, _psl, _supply),
      supply: _supply
    }
    
    setNewInfoState(response)
  }

  const simulateRedeem = (amt: number) => {
    let rawTotal: number = amt * floorPrice(gammInfoState.fsl, gammInfoState.supply)

    const response = {
      fsl: gammInfoState.fsl - rawTotal,
      psl: gammInfoState.psl,
      floor: floorPrice(gammInfoState.fsl - rawTotal, gammInfoState.supply - redeemingLocksState),
      market: marketPrice(gammInfoState.fsl - rawTotal, gammInfoState.psl, gammInfoState.supply - redeemingLocksState),
      supply: gammInfoState.supply - redeemingLocksState
    }

    setNewInfoState(response)
    simulateFloorRaise(gammInfoState.fsl - rawTotal, gammInfoState.psl, gammInfoState.supply - redeemingLocksState)
  }

  const simulateFloorRaise = (_fsl: number, _psl: number, _supply: number) => {
    if(_psl / _fsl >= gammInfoState.targetRatio) {
      let raiseAmount: number = (_psl / _fsl) * (_psl / 32)
      setNewInfoState((prevState) => {
        const newFsl = prevState.fsl + raiseAmount;
        const newPsl = prevState.psl - raiseAmount;
        const newFloor = floorPrice(newFsl, prevState.supply);
        const newMarket = marketPrice(newPsl, newPsl - raiseAmount, prevState.supply);
      
        return {
          ...prevState,
          fsl: newFsl,
          psl: newPsl,
          floor: newFloor,
          market: newMarket
        }
      })
    }
  }

  const handleTopBalance = (): string => {
    if(activeToggleState === 'buy') {
      return balance.honey > 0 ? balance.honey.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"      
    }
    else {
      return balance.locks > 0 ? balance.locks.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
  }

  const handleBottomBalance = (): string => {
    if(activeToggleState === 'buy') {
      return balance.locks > 0 ? balance.locks.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
    else {
      return balance.honey > 0 ? balance.honey.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"      
    }
  }

  const handleTopInput = (): string => {
    if(activeToggleState === 'buy') {
      return isConnected && honeyBuyState > balance.honey ? '' : displayStringState
    }
    else if(activeToggleState === 'sell') {
      return sellingLocksState > balance.locks ? '' : displayStringState
    }
    else {
      return redeemingLocksState > balance.locks ? '' : displayStringState
    }
  }

  const handleBottomInput = (): string => {
    if(activeToggleState === 'buy') {
      return isConnected && simulateBuyDry(buyingLocksState, gammInfoState.fsl, gammInfoState.psl, gammInfoState.supply) > balance.honey ? '' : bottomDisplayStringState
    }
    else if(activeToggleState === 'sell') {
      return bottomDisplayStringState
    }
    else {
      return redeemingHoneyState / (gammInfoState.fsl / gammInfoState.supply) > balance.locks ? '' : bottomDisplayStringState
    }
  }

  const handleTopChange = (input: string) => {
    setDisplayStringState(input)
    setBottomInputFlagState(false)
    if(activeToggleState === 'buy') {
      !input ? setHoneyBuyState(0) : setHoneyBuyState(parseFloat(input))
    }
    else if(activeToggleState === 'sell') {
      !input ? setSellingLocksState(0) : setSellingLocksState(parseFloat(input))
    }
    else {
      !input ? setRedeemingLocksState(0) : setRedeemingLocksState(parseFloat(input))
    }
  }
  
  const handleBottomChange = (input: string) => {
    setBottomDisplayStringState(input)
    setTopInputFlagState(false)
    if(activeToggleState === 'buy') {
      !input ? setBuyingLocksState(0) : setBuyingLocksState(parseFloat(input))
    }
    else if(activeToggleState === 'sell') {
      !input ? setGettingHoneyState(0) : setGettingHoneyState(parseFloat(input))
    }
    else {
      !input ? setRedeemingHoneyState(0) : setRedeemingHoneyState(parseFloat(input))
    }
  }

  const refreshGammInfo = async () => {
    const fsl = await gammContract.read.fsl([])
    const psl = await gammContract.read.psl([])
    const supply = await gammContract.read.supply([])
    const targetRatio = await gammContract.read.targetRatio([])
    const lastFloorRaise = await gammContract.read.lastFloorRaise([])
    let honeyAmmAllowance
    if(wallet) {
      honeyAmmAllowance = await honeyContract.read.allowance([wallet, contracts.gamm.address])
    }

    const response = {
      fsl: parseFloat(formatEther(fsl as unknown as bigint)),
      psl: parseFloat(formatEther(psl as unknown as bigint)),
      supply: parseFloat(formatEther(supply as unknown as bigint)),
      targetRatio: parseFloat(formatEther(targetRatio as unknown as bigint)),
      lastFloorRaise: parseFloat(formatEther(lastFloorRaise as unknown as bigint)),
      honeyAmmAllowance: wallet ? parseFloat(formatEther(honeyAmmAllowance as unknown as bigint)) : 0
    }

    const newResponse = {
      fsl: parseFloat(formatEther(fsl as unknown as bigint)),
      psl: parseFloat(formatEther(psl as unknown as bigint)),
      floor: floorPrice(parseFloat(formatEther(fsl as unknown as bigint)), parseFloat(formatEther(supply as unknown as bigint))),
      market: marketPrice(parseFloat(formatEther(fsl as unknown as bigint)), parseFloat(formatEther(psl as unknown as bigint)), parseFloat(formatEther(supply as unknown as bigint))),
      supply: parseFloat(formatEther(supply as unknown as bigint)),
    }

    setGammInfoState(response)
    setNewInfoState(newResponse)
  }

  const checkSlippageAmount = () => {
    const storedSlippageAmount = localStorage.getItem('slippageAmount')
    if(storedSlippageAmount !== null) {
      changeSlippage(parseFloat(storedSlippageAmount), storedSlippageAmount)
    }
  }

  const refreshChartInfo = async () => {
    const data = publicClient.readContract({
      address: contracts.gamm.address as `0x${string}`,
      abi: contracts.gamm.abi,
      functionName: 'floorPrice',
      args: [],
      // blockNumber: 24389463 as unknown as bigint
    })

    console.log(data)
  }

  return (
    <GammContext.Provider
      value={{
        gammInfo: gammInfoState,
        newInfo: newInfoState,
        slippage: slippageState,
        activeToggle: activeToggleState,
        displayString: displayStringState,
        bottomDisplayString: bottomDisplayStringState,
        honeyBuy: honeyBuyState,
        debouncedHoneyBuy: debouncedHoneyBuyState,
        debouncedGettingHoney: debouncedGettingHoneyState,
        setHoneyBuy: setHoneyBuyState,
        setGettingHoney: setGettingHoneyState,
        setBuyingLocks: setBuyingLocksState,
        setRedeemingHoney: setRedeemingHoneyState,
        setSellingLocks: setSellingLocksState,
        setRedeemingLocks: setRedeemingLocksState,
        setDisplayString: setDisplayStringState,
        setBottomDisplayString: setBottomDisplayStringState,
        sellingLocks: sellingLocksState,
        redeemingLocks: redeemingLocksState,
        buyingLocks: buyingLocksState,
        gettingHoney: gettingHoneyState,
        redeemingHoney: redeemingHoneyState,
        topInputFlag: topInputFlagState,
        bottomInputFlag: bottomInputFlagState,
        setTopInputFlag: setTopInputFlagState,
        setBottomInputFlag: setBottomInputFlagState,
        changeNewInfo,
        simulateBuy,
        simulateSell,
        simulateRedeem,
        flipTokens,
        findLocksBuyAmount,
        findLocksSellAmount,
        handlePercentageButtons,
        handleTopBalance,
        handleTopInput,
        handleTopChange,
        handleBottomBalance,
        handleBottomChange,
        handleBottomInput,
        changeActiveToggle,
        changeSlippage,
        checkSlippageAmount,
        changeSlippageToggle,
        refreshGammInfo,
        refreshChartInfo
      }}
    >
      { children }
    </GammContext.Provider>
  )
}

export const useGamm = () => useContext(GammContext)