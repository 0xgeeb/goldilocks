"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { useContractReads } from "wagmi"
//todo: viem
import { BigNumber, Signer, ethers } from "ethers"
import { useWallet } from ".."
import { useDebounce } from "../../hooks/gamm"
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

  changeSlippage: (amount: number, displayString: string) => {},
  changeSlippageToggle: (toggle: boolean) => {},

  activeToggle: 'buy',
  changeActiveToggle: (toggle: string) => {},

  displayString: '',
  changeDisplayString: (displayString: string) => {},
  handlePercentageButtons: (action: number) => {},

  //todo: could maybe put the below in a hook instead
  getGammInfo: async (): Promise<any> => {},
  refreshGammInfo: async (signer: any): Promise<any> => {},
  checkAllowance: async (token: string, spender: string, amount: number, signer: any): Promise<void | boolean> => {},
  sendApproveTx: async (token: string, spender: string, amount: number, signer: any) => {},
  sendBuyTx: async (buy: number, amount: number, signer: any): Promise<any> => {},
  sendSellTx: async (sell: number, receive: number, signer: any): Promise<any> => {},
  sendRedeemTx: async (redeem: number, signer: any): Promise<any> => {}
}

const GammContext = createContext(INITIAL_STATE)

export const GammProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { balance, wallet } = useWallet()

  //todo: type
  const [gammInfoState, setGammInfoState] = useState(INITIAL_STATE.gammInfo)
  const [newInfoState, setNewInfoState] = useState(INITIAL_STATE.newInfo)
  const [slippageState, setSlippageState] = useState(INITIAL_STATE.slippage)
  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)
  const [displayStringState, setDisplayStringState] = useState<string>(INITIAL_STATE.displayString)

  const [honeyBuyState, setHoneyBuyState] = useState<number>(INITIAL_STATE.honeyBuy)
  const debouncedHoneyBuyState = useDebounce(honeyBuyState, 1000)
  const [sellingLocksState, setSellingLocksState] = useState<number>(INITIAL_STATE.sellingLocks)
  const [redeemingLocksState, setRedeemingLocksState] = useState<number>(INITIAL_STATE.redeemingLocks)

  const { data: info } = useContractReads({
    contracts: [
      {
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'fsl'
      },
      {
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'psl'
      },
      {
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'supply'
      },
      {
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'targetRatio'
      },
      {
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'lastFloorRaise'
      },
      {
        address: contracts.honey.address as `0x${string}`,
        abi: contracts.honey.abi,
        functionName: 'allowance',
        args: [wallet, contracts.amm.address]
      }
    ]
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

  const changeActiveToggle = (toggle: string) => {
    setActiveToggleState(toggle)
  }
  
  const changeDisplayString = (displayString: string) => {
    setDisplayStringState(displayString)
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

  const getGammInfo = async (): Promise<any> => {
    if(info) {
      const [fsl, psl, supply, targetRatio, lastFloorRaise, honeyAmmAllowance] = info as unknown as [number, number, number, number, number, number]
      let response = {
        fsl: fsl / Math.pow(10, 18),
        psl: psl / Math.pow(10, 18),
        supply: supply / Math.pow(10, 18),
        targetRatio: targetRatio / Math.pow(10, 18),
        lastFloorRaise: lastFloorRaise / Math.pow(10, 18),
        honeyAmmAllowance: honeyAmmAllowance / Math.pow(10, 18)
      }
      setGammInfoState(response)
      return response
    }
  }

  const refreshGammInfo = async (signer: Signer): Promise<any> => {
    let response = {
      fsl: 0,
      psl: 0,
      supply: 0,
      targetRatio: 0,
      lastFloorRaise: 0,
      honeyAmmAllowance: 0
    }

    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    const fslTx = await ammContract.fsl()
    response = { ...response, fsl: fslTx._hex / Math.pow(10, 18)}
    const pslTx = await ammContract.psl()
    response = { ...response, psl: pslTx._hex / Math.pow(10, 18)}
    const supplyTx = await ammContract.supply()
    response = { ...response, supply: supplyTx._hex / Math.pow(10, 18)}
    const ratioTx = await ammContract.targetRatio()
    response = { ...response, targetRatio: ratioTx._hex / Math.pow(10, 18)}
    const lastRaiseTx = await ammContract.lastFloorRaise()
    response = { ...response, lastFloorRaise: lastRaiseTx._hex / Math.pow(10, 18)}

    const honeyContract = new ethers.Contract(
      contracts.honey.address,
      contracts.honey.abi,
      signer
    )
    const allowanceTx = await honeyContract.allowance(wallet, contracts.amm.address)
    response = { ...response, honeyAmmAllowance: allowanceTx._hex / Math.pow(10, 18)}

    setGammInfoState(response)
    return response
  }

  const checkAllowance = async (token: string, spender: string, amount: number, signer: Signer): Promise<boolean> => {
    const tokenContract = new ethers.Contract(
      contracts[token].address,
      contracts[token].abi,
      signer
    )
    const allowanceTx = await tokenContract.allowance(wallet, spender)
    const allowanceNum = allowanceTx._hex / Math.pow(10, 18)
    console.log('allowanceNum: ', allowanceNum)
    console.log('amount: ', amount)
    if(amount > allowanceNum) {
      return false
    }
    else {
      return true
    }
  }

  const sendApproveTx = async (token: string, spender: string, amount: number, signer: any) => {
    const tokenContract = new ethers.Contract(
      contracts[token].address,
      contracts[token].abi,
      signer
    )

    try {
      const approveTx = await tokenContract.approve(spender, BigNumber.from(ethers.utils.parseUnits((amount + 0.01).toString(), 18))) 
      await approveTx.wait()
      console.log('done waiting')
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendBuyTx = async (buy: number, amount: number, signer: any): Promise<any> => {
    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    try {
      const buyReceipt = await ammContract.buy(BigNumber.from(ethers.utils.parseUnits(buy.toString(), 18)), BigNumber.from(ethers.utils.parseUnits(amount.toString(), 18)))
      await buyReceipt.wait()
      return buyReceipt
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendSellTx = async (sell: number, receive: number, signer: any): Promise<any> => {
    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    try {
      const sellReceipt = await ammContract.sell(BigNumber.from(ethers.utils.parseUnits(sell.toString(), 18)), BigNumber.from(ethers.utils.parseUnits(receive.toString(), 18)))
      await sellReceipt.wait()
      return sellReceipt
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendRedeemTx = async (redeem: number, signer: any): Promise<any> => {
    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    try {
      const redeemReceipt = await ammContract.redeem(BigNumber.from(ethers.utils.parseUnits(redeem.toString(), 18)))
      await redeemReceipt.wait()
      return redeemReceipt
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
        honeyBuy: honeyBuyState,
        sellingLocks: sellingLocksState,
        redeemingLocks: redeemingLocksState,
        changeDisplayString,
        handlePercentageButtons,
        changeActiveToggle,
        changeSlippage,
        changeSlippageToggle,
        getGammInfo,
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