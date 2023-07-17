"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { parseEther, formatEther } from "viem"
import { getContract, writeContract, waitForTransaction } from "@wagmi/core"
import { useWallet } from ".."
import { contracts } from "../../utils/addressi"

//todo: type
const INITIAL_STATE = {
  stakingInfo: {
    fsl: 0,
    supply: 0,
    staked: 0,
    yieldToClaim: 0,
    locksPrgAllowance: 0,
    honeyPrgAllowance: 0
  },

  stake: 0,
  unstake: 0,
  realize: 0,

  setStake: (stake: number) => {},
  setUnstake: (unstake: number) => {},
  setRealize: (realize: number) => {},

  displayString: '',
  setDisplayString: (displayString: string) => {},

  activeToggle: 'stake',
  changeActiveToggle: (toggle: string) => {},

  renderLabel: () => '',
  handleBalance: () => '',
  handlePercentageButtons: (action: number) => {},
  handleChange: (input: string) => {},
  handleInput: () => '',


  refreshStakingInfo: async () =>  {},
  checkAllowance: async (amt: number, token: string): Promise<void | boolean> => {},
  sendApproveTx: async (amt: number, token: string) => {},
  sendStakeTx: async (stakeAmt: number): Promise<any> => {},
  sendUnstakeTx: async (unstakeAmt: number): Promise<any> => {},
  sendRealizeTx: async (realizeAmt: number): Promise<any> => {},
  sendClaimTx: async (): Promise<any> => {}
}

const StakingContext = createContext(INITIAL_STATE)

export const StakingProvider = (props: PropsWithChildren<{}>) => {
  
  const { children } = props

  const { balance, wallet } = useWallet()

  //todo: type
  const [stakingInfoState, setStakingInfoState] = useState(INITIAL_STATE.stakingInfo)
  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)

  const [displayStringState, setDisplayStringState] = useState(INITIAL_STATE.displayString)

  const [stakeState, setStakeState] = useState<number>(INITIAL_STATE.stake)
  const [unstakeState, setUnstakeState] = useState<number>(INITIAL_STATE.unstake)
  const [realizeState, setRealizeState] = useState<number>(INITIAL_STATE.realize)

  const porridgeContract = getContract({
    address: contracts.porridge.address as `0x${string}`,
    abi: contracts.porridge.abi
  })

  const gammContract = getContract({
    address: contracts.amm.address as `0x${string}`,
    abi: contracts.amm.abi
  })

  const honeyContract = getContract({
    address: contracts.honey.address as `0x${string}`,
    abi: contracts.honey.abi
  })

  const changeActiveToggle = (toggle: string) => {
    setDisplayStringState('')
    setStakeState(0)
    setUnstakeState(0)
    setRealizeState(0)
    setActiveToggleState(toggle)
  }

  const handleBalance = (): string => {
    if(activeToggleState === 'stake') {
      return balance.locks > 0 ? balance.locks.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
    if(activeToggleState === 'unstake') {
      return stakingInfoState.staked > 0 ? stakingInfoState.staked.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
    if(activeToggleState === 'realize') {
      return balance.prg > 0 ? balance.prg.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }

    return ''
  }

  const handlePercentageButtons = (action: number) => {
    if(action == 1) {
      if(activeToggleState === 'stake') {
        setDisplayStringState((balance.locks / 4).toFixed(2))
        setStakeState(balance.locks / 4)
      }
      if(activeToggleState === 'unstake') {
        setDisplayStringState((stakingInfoState.staked / 4).toFixed(2))
        setUnstakeState(stakingInfoState.staked / 4)
      }
      if(activeToggleState === 'realize') {
        setDisplayStringState((balance.prg / 4).toFixed(2))
        setRealizeState(balance.prg / 4)
      }
    }
    if(action == 2) {
      if(activeToggleState === 'stake') {
        setDisplayStringState((balance.locks / 2).toFixed(2))
        setStakeState(balance.locks / 2)
      }
      if(activeToggleState === 'unstake') {
        setDisplayStringState((stakingInfoState.staked / 2).toFixed(2))
        setUnstakeState(stakingInfoState.staked / 2)
      }
      if(activeToggleState === 'realize') {
        setDisplayStringState((balance.prg / 2).toFixed(2))
        setRealizeState(balance.prg / 2)
      }
    }
    if(action == 3) {
      if(activeToggleState === 'stake') {
        setDisplayStringState((balance.locks * 0.75).toFixed(2))
        setStakeState(balance.locks * 0.75)
      }
      if(activeToggleState === 'unstake') {
        setDisplayStringState((stakingInfoState.staked * 0.75).toFixed(2))
        setUnstakeState(stakingInfoState.staked * 0.75)
      }
      if(activeToggleState === 'realize') {
        setDisplayStringState((balance.prg * 0.75).toFixed(2))
        setRealizeState(balance.prg * 0.75)
      }
    }
    if(action == 4) {
      if(activeToggleState === 'stake') {
        setDisplayStringState(balance.locks.toFixed(2))
        setStakeState(balance.locks)
      }
      if(activeToggleState === 'unstake') {
        setDisplayStringState(stakingInfoState.staked.toFixed(2))
        setUnstakeState(stakingInfoState.staked)
      }
      if(activeToggleState === 'realize') {
        setDisplayStringState(balance.prg.toFixed(2))
        setRealizeState(balance.prg)
      }
    }
  }

  const renderLabel = (): string => {
    if(activeToggleState === 'stake') {
      return 'stake'
    }
    if(activeToggleState === 'unstake') {
      return 'unstake'
    }
    if(activeToggleState === 'realize') {
      return 'sir'
    }

    return ''
  }

  const handleChange = (input: string) => {
    setDisplayStringState(input)
    if(activeToggleState === 'stake') {
      !input ? setStakeState(0) : setStakeState(parseFloat(input))
    }
    if(activeToggleState === 'unstake') {
      !input ? setUnstakeState(0) : setUnstakeState(parseFloat(input))
    }
    if(activeToggleState === 'realize') {
      !input ? setRealizeState(0) : setRealizeState(parseFloat(input))
    }
  }

  const handleInput = (): string => {
    if(activeToggleState === 'stake') {
      return stakeState > balance.locks ? '' : displayStringState
    }
    if(activeToggleState === 'unstake') {
      return unstakeState > stakingInfoState.staked ? '' : displayStringState
    }
    if(activeToggleState === 'realize') {
      return realizeState > balance.prg ? '' : displayStringState
    }

    return ''
  }

  const refreshStakingInfo = async () => {
    const fsl = await gammContract.read.fsl([])
    const supply = await gammContract.read.supply([])
    let staked
    let yieldToClaim
    let locksPrgAllowance
    let honeyPrgAllowance
    //todo: update abi
    if(wallet) {
      staked = await porridgeContract.read.getStaked([wallet])
      // yieldToClaim = await porridgeContract.read.getClaimable([wallet])
      // locksPrgAllowance = await gammContract.read.allowance([wallet, contracts.porridge.address])
      honeyPrgAllowance = await honeyContract.read.allowance([wallet, contracts.porridge.address])
    } 


    const response = {
      fsl: parseFloat(formatEther(fsl as unknown as bigint)),
      supply: parseFloat(formatEther(supply as unknown as bigint)),
      staked: wallet ? parseFloat(formatEther(staked as unknown as bigint)) : 0, 
      // yieldToClaim: wallet ? parseFloat(formatEther(yieldToClaim as unknown as bigint)) : 0, 
      // locksPrgAllowance: wallet ? parseFloat(formatEther(locksPrgAllowance as unknown as bigint)) : 0, 
      yieldToClaim: 0,
      locksPrgAllowance: 0,
      honeyPrgAllowance: wallet ? parseFloat(formatEther(honeyPrgAllowance as unknown as bigint)) : 0, 
    }

    setStakingInfoState(response)
  }

  const checkAllowance = async (amt: number, token: string): Promise<boolean> => {
    let allowance
    let allowanceNum

    if(token === 'locks') {
      allowance = await gammContract.read.allowance([wallet, contracts.porridge.address])
      allowanceNum = parseFloat(formatEther(allowance as unknown as bigint))
    }
    else {
      allowance = await honeyContract.read.allowance([wallet, contracts.porridge.address])
      allowanceNum = parseFloat(formatEther(allowance as unknown as bigint))
    }

    console.log('allowanceNum: ', allowanceNum)
    console.log('amount: ', amt)
    
    if(amt > allowanceNum) {
      return false
    }
    else {
      return true
    }
  }

  const sendApproveTx = async (amt: number, token: string) => {
    if(token === 'locks') {
      try {
        await writeContract({
          address: contracts.amm.address as `0x${string}`,
          abi: contracts.amm.abi,
          functionName: 'approve',
          args: [contracts.porridge.address, parseEther(`${amt}`)]
        })
      }
      catch (e) {
        console.log('user denied tx')
        console.log('or: ', e)
      }
    }
    else {
      try {
        await writeContract({
          address: contracts.honey.address as `0x${string}`,
          abi: contracts.honey.abi,
          functionName: 'approve',
          args: [contracts.porridge.address, parseEther(`${amt}`)]
        })
      }
      catch (e) {
        console.log('user denied tx')
        console.log('or: ', e)
      }

    }
  }

  const sendStakeTx = async (stakeAmt: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.porridge.address as `0x${string}`,
        abi: contracts.porridge.abi,
        functionName: 'stake',
        args: [parseEther(`${stakeAmt}`)]
      })
      const data = await waitForTransaction({ hash })
      return data.transactionHash
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }

    return ''
  }

  const sendUnstakeTx = async (unstakeAmt: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.porridge.address as `0x${string}`,
        abi: contracts.porridge.abi,
        functionName: 'unstake',
        args: [parseEther(`${unstakeAmt}`)]
      })
      const data = await waitForTransaction({ hash })
      return data.transactionHash
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }

    return ''
  }

  const sendRealizeTx = async (realizeAmt: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.porridge.address as `0x${string}`,
        abi: contracts.porridge.abi,
        functionName: 'realize',
        args: [parseEther(`${realizeAmt}`)]
      })
      const data = await waitForTransaction({ hash })
      return data.transactionHash
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }

    return ''
  }

  const sendClaimTx = async (): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.porridge.address as `0x${string}`,
        abi: contracts.porridge.abi,
        functionName: 'claim',
        args: []
      })
      const data = await waitForTransaction({ hash })
      return data.transactionHash
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }

    return ''
  }

  return (
    <StakingContext.Provider
      value={{
        stakingInfo: stakingInfoState,
        stake: stakeState,
        unstake: unstakeState,
        realize: realizeState,
        setStake: setStakeState,
        setUnstake: setUnstakeState,
        setRealize: setRealizeState,
        displayString: displayStringState,
        setDisplayString: setDisplayStringState,
        activeToggle: activeToggleState,
        changeActiveToggle,
        renderLabel,
        handleBalance,
        handlePercentageButtons,
        handleChange,
        handleInput,
        refreshStakingInfo,
        checkAllowance,
        sendApproveTx,
        sendStakeTx,
        sendUnstakeTx,
        sendRealizeTx,
        sendClaimTx
      }}
    >
      { children }
    </StakingContext.Provider>
  )
}

export const useStaking = () => useContext(StakingContext)