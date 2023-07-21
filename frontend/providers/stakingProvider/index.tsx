"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { formatEther } from "viem"
import { getContract } from "@wagmi/core"
import { useWallet } from ".."
import { contracts } from "../../utils/addressi"
import { StakingInitialState, StakingInfo } from "../../utils/interfaces"

const INITIAL_STATE: StakingInitialState = {
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

  setStake: (_stake: number) => {},
  setUnstake: (_unstake: number) => {},
  setRealize: (_realize: number) => {},

  displayString: '',
  setDisplayString: (_displayString: string) => {},

  activeToggle: 'stake',
  changeActiveToggle: (_toggle: string) => {},

  renderLabel: () => '',
  handleBalance: () => '',
  handlePercentageButtons: (_action: number) => {},
  handleChange: (_input: string) => {},
  handleInput: () => '',

  refreshStakingInfo: async () =>  {}
}

const StakingContext = createContext(INITIAL_STATE)

export const StakingProvider = (props: PropsWithChildren<{}>) => {
  
  const { children } = props

  const { balance, wallet } = useWallet()

  const [stakingInfoState, setStakingInfoState] = useState<StakingInfo>(INITIAL_STATE.stakingInfo)
  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)

  const [displayStringState, setDisplayStringState] = useState<string>(INITIAL_STATE.displayString)

  const [stakeState, setStakeState] = useState<number>(INITIAL_STATE.stake)
  const [unstakeState, setUnstakeState] = useState<number>(INITIAL_STATE.unstake)
  const [realizeState, setRealizeState] = useState<number>(INITIAL_STATE.realize)

  const honeyContract = getContract({
    address: contracts.honey.address as `0x${string}`,
    abi: contracts.honey.abi
  })
  
  const gammContract = getContract({
    address: contracts.gamm.address as `0x${string}`,
    abi: contracts.gamm.abi
  })
  
  const porridgeContract = getContract({
    address: contracts.porridge.address as `0x${string}`,
    abi: contracts.porridge.abi
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
      return 'stir'
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
    if(wallet) {
      staked = await porridgeContract.read.getStaked([wallet])
      yieldToClaim = await porridgeContract.read.getClaimable([wallet])
      locksPrgAllowance = await gammContract.read.allowance([wallet, contracts.porridge.address])
      honeyPrgAllowance = await honeyContract.read.allowance([wallet, contracts.porridge.address])
    } 


    const response = {
      fsl: parseFloat(formatEther(fsl as unknown as bigint)),
      supply: parseFloat(formatEther(supply as unknown as bigint)),
      staked: wallet ? parseFloat(formatEther(staked as unknown as bigint)) : 0, 
      yieldToClaim: wallet ? parseFloat(formatEther(yieldToClaim as unknown as bigint)) : 0, 
      locksPrgAllowance: wallet ? parseFloat(formatEther(locksPrgAllowance as unknown as bigint)) : 0, 
      honeyPrgAllowance: wallet ? parseFloat(formatEther(honeyPrgAllowance as unknown as bigint)) : 0, 
    }

    setStakingInfoState(response)
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
        refreshStakingInfo
      }}
    >
      { children }
    </StakingContext.Provider>
  )
}

export const useStaking = () => useContext(StakingContext)