"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { parseEther, formatEther } from "viem"
import { getContract, writeContract } from "@wagmi/core"
import { useWallet } from ".."
import { useDebounce, useGammMath } from "../../hooks/gamm"
import { contracts } from "../../utils/addressi"

//todo: type
const INITIAL_STATE = {
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

  buyingLocks: 0,
  gettingHoney: 0,
  redeemingHoney: 0,

  topInputFlag: false,
  bottomInputFlag: false,

  changeSlippage: (amount: number, displayString: string) => {},
  changeSlippageToggle: (toggle: boolean) => {},

  activeToggle: 'buy',
  changeActiveToggle: (toggle: string) => {},

  displayString: '',
  changeDisplayString: (displayString: string) => {},
  bottomDisplayString: '',
  changeBottomDisplayString: (bottomDisplayString: string) => {},

  handlePercentageButtons: (action: number) => {},

  flipTokens: () => {},

  handleTopInput: (): string => '',
  handleTopChange: (input: string) => {},
  handleTopBalance: (): string => "0.00",

  handleBottomInput: (): string => '',
  handleBottomChange: (input: string) => {},
  handleBottomBalance: (): string => "0.00",

  debouncedHoneyBuy: 0,

  //todo: could maybe put the below in a hook instead
  refreshGammInfo: async () => {},
  checkAllowance: async (amt: number): Promise<void | boolean> => {},
  sendApproveTx: async (amt: number) => {},
  sendBuyTx: async (buyAmt: number, maxCost: number): Promise<any> => {},
  sendSellTx: async (sellAmt: number, minReceive: number): Promise<any> => {},
  sendRedeemTx: async (redeemAmt: number): Promise<any> => {}
}

const GammContext = createContext(INITIAL_STATE)

export const GammProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { balance, wallet, isConnected } = useWallet()
  const { simulateBuyDry } = useGammMath()

  //todo: type
  const [gammInfoState, setGammInfoState] = useState(INITIAL_STATE.gammInfo)
  const [newInfoState, setNewInfoState] = useState(INITIAL_STATE.newInfo)
  const [slippageState, setSlippageState] = useState(INITIAL_STATE.slippage)
  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)

  const [displayStringState, setDisplayStringState] = useState<string>(INITIAL_STATE.displayString)
  const [bottomDisplayStringState, setBottomDisplayStringState] = useState<string>(INITIAL_STATE.bottomDisplayString)

  const [honeyBuyState, setHoneyBuyState] = useState<number>(INITIAL_STATE.honeyBuy)
  const debouncedHoneyBuyState = useDebounce(honeyBuyState, 1000)
  const [sellingLocksState, setSellingLocksState] = useState<number>(INITIAL_STATE.sellingLocks)
  const [redeemingLocksState, setRedeemingLocksState] = useState<number>(INITIAL_STATE.redeemingLocks)

  const [buyingLocksState, setBuyingLocksState] = useState<number>(INITIAL_STATE.buyingLocks)
  const [gettingHoneyState, setGettingHoneyState] = useState<number>(INITIAL_STATE.gettingHoney)
  const debouncedGettingHoney = useDebounce(gettingHoneyState, 1000)
  const [redeemingHoneyState, setRedeemingHoneyState] = useState<number>(INITIAL_STATE.redeemingHoney)

  const [topInputFlagState, setTopInputFlagState] = useState<boolean>(INITIAL_STATE.topInputFlag)
  const [bottomInputFlagState, setBottomInputFlagState] = useState<boolean>(INITIAL_STATE.bottomInputFlag)

  const honeyContract = getContract({
    address: contracts.honey.address as `0x${string}`,
    abi: contracts.honey.abi
  })

  const gammContract = getContract({
    address: contracts.amm.address as `0x${string}`,
    abi: contracts.amm.abi
  })

  const changeSlippage = (amount: number, displayString: string) => {
    const updatedState = { ...slippageState }
    updatedState.amount = amount
    updatedState.displayString = displayString
    setSlippageState(updatedState)
  }

  const changeSlippageToggle = (toggle: boolean) => {
    const updatedState = { ...slippageState }
    updatedState.toggle = toggle
    setSlippageState(updatedState)
  }

  //todo: zero honeybuy and shit out when doing this
  const changeActiveToggle = (toggle: string) => {
    setActiveToggleState(toggle)
  }
  
  const changeDisplayString = (displayString: string) => {
    setDisplayStringState(displayString)
  }

  const changeBottomDisplayString = (bottomDisplayString: string) => {
    setBottomDisplayStringState(bottomDisplayString)
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
      return simulateBuyDry(buyingLocksState, gammInfoState.fsl, gammInfoState.psl, gammInfoState.supply) > balance.honey ? '' : bottomDisplayStringState
    }
    else if(activeToggleState === 'sell') {
      return bottomDisplayStringState
    }
    else {
      return redeemingHoneyState / (gammInfoState.fsl / gammInfoState.supply) > balance.locks ? '' : bottomDisplayStringState
    }
  }

  //todo: move setflag to once above conditionals
  const handleTopChange = (input: string) => {
    setDisplayStringState(input)
    if(activeToggleState === 'buy') {
      if(!input) {
        setBottomInputFlagState(false)
        setHoneyBuyState(0)
      }
      else {
        setBottomInputFlagState(false)
        setHoneyBuyState(parseFloat(input))
      }
    }
    else if(activeToggleState === 'sell') {
      if(!input) {
        setBottomInputFlagState(false)
        setSellingLocksState(0)
      }
      else {
        setBottomInputFlagState(false)
        setSellingLocksState(parseFloat(input))
      }
    }
    else {
      if(!input) {
        setBottomInputFlagState(false)
        setRedeemingLocksState(0)
      }
      else {
        setBottomInputFlagState(false)
        setRedeemingLocksState(parseFloat(input))
      }
    }
  }
  
  //todo: move setflag to once above conditionals
  const handleBottomChange = (input: string) => {
    setBottomDisplayStringState(input)
    if(activeToggleState === 'buy') {
      if(!input) {
        setTopInputFlagState(false)
        setBuyingLocksState(0)
      }
      else {
        setTopInputFlagState(false)
        setBuyingLocksState(parseFloat(input))
      }
    }
    else if(activeToggleState === 'sell') {
      if(!input) {
        setTopInputFlagState(false)
        setGettingHoneyState(0)
      }
      else {
        setTopInputFlagState(false)
        setGettingHoneyState(parseFloat(input))
      }
    }
    else {
      if(!input) {
        setTopInputFlagState(false)
        setRedeemingHoneyState(0)
      }
      else {
        setTopInputFlagState(false)
        setRedeemingHoneyState(parseFloat(input))
      }
    }
  }

  const flipTokens = () => {
    if(activeToggleState === 'buy') {
      setActiveToggleState('sell')
    }
    else if(activeToggleState === 'sell') {
      setActiveToggleState('buy')
    }
    else {
      return
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
      honeyAmmAllowance = await honeyContract.read.allowance([wallet, contracts.amm.address])
    }

    const response = {
      fsl: parseFloat(formatEther(fsl as unknown as bigint)),
      psl: parseFloat(formatEther(psl as unknown as bigint)),
      supply: parseFloat(formatEther(supply as unknown as bigint)),
      targetRatio: parseFloat(formatEther(targetRatio as unknown as bigint)),
      lastFloorRaise: parseFloat(formatEther(lastFloorRaise as unknown as bigint)),
      honeyAmmAllowance: wallet ? parseFloat(formatEther(honeyAmmAllowance as unknown as bigint)) : 0
    }

    setGammInfoState(response)
  }

  const checkAllowance = async (amt: number): Promise<boolean> => {
    const allowance = await honeyContract.read.allowance([wallet, contracts.amm.address])
    const allowanceNum = parseFloat(formatEther(allowance as unknown as bigint))

    console.log('allowanceNum: ', allowanceNum)
    console.log('amount: ', amt)
    
    if(amt > allowanceNum) {
      return false
    }
    else {
      return true
    }
  }

  const sendApproveTx = async (amt: number) => {
    try {
      await writeContract({
        address: contracts.honey.address as `0x${string}`,
        abi: contracts.honey.abi,
        functionName: 'approve',
        args: [contracts.amm.address, parseEther(`${amt + 0.01}`)]
      })
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  //todo: receipt and receipt type
  const sendBuyTx = async (buyAmt: number, maxCost: number): Promise<any> => {
    try {
      await writeContract({
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'buy',
        args: [parseEther(`${buyAmt}`), parseEther(`${maxCost}`)]
      })
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  //todo: receipt and receipt type
  const sendSellTx = async (sellAmt: number, minReceive: number): Promise<any> => {
    try {
      await writeContract({
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'sell',
        args: [parseEther(`${sellAmt}`), parseEther(`${minReceive}`)]
      })
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  //todo: receipt and receipt type
  const sendRedeemTx = async (redeemAmt: number): Promise<any> => {
    try {
      await writeContract({
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'redeem',
        args: [parseEther(`${redeemAmt}`)]
      })
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
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
        sellingLocks: sellingLocksState,
        redeemingLocks: redeemingLocksState,
        buyingLocks: buyingLocksState,
        gettingHoney: gettingHoneyState,
        redeemingHoney: redeemingHoneyState,
        topInputFlag: topInputFlagState,
        bottomInputFlag: bottomInputFlagState,
        flipTokens,
        changeDisplayString,
        changeBottomDisplayString,
        handlePercentageButtons,
        handleTopBalance,
        handleTopInput,
        handleTopChange,
        handleBottomBalance,
        handleBottomChange,
        handleBottomInput,
        changeActiveToggle,
        changeSlippage,
        changeSlippageToggle,
        refreshGammInfo,
        checkAllowance,
        sendApproveTx,
        sendBuyTx,
        sendSellTx,
        sendRedeemTx,
      }}
    >
      { children }
    </GammContext.Provider>
  )
}

export const useGamm = () => useContext(GammContext)