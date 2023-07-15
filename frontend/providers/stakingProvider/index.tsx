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

  activeToggle: 'buy',
  changeActiveToggle: (toggle: string) => {},
}

const StakingContext = createContext(INITIAL_STATE)

export const StakingProvider = (props: PropsWithChildren<{}>) => {
  
  const { children } = props

  const { balance, wallet, isConnected } = useWallet()

  //todo: type
  const [stakingInfoState, setStakingInfoState] = useState(INITIAL_STATE.stakingInfo)
  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)

  const [displayStringState, setDisplayStringState] = useState(INITIAL_STATE.displayString)

  const [stakeState, setStakeState] = useState<number>(INITIAL_STATE.stake)
  const [unstakeState, setUnstakeState] = useState<number>(INITIAL_STATE.unstake)
  const [realizeState, setRealizeState] = useState<number>(INITIAL_STATE.realize)

  const stakingContract = getContract({
    address: contracts.porridge.address as `0x${string}`,
    abi: contracts.porridge.abi
  })

  const gammContract = getContract({
    address: contracts.amm.address as `0x${string}`,
    abi: contracts.amm.abi
  })

  const changeActiveToggle = (toggle: string) => {
    setDisplayStringState('')
    setStakeState(0)
    setUnstakeState(0)
    setRealizeState(0)
    setActiveToggleState(toggle)
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
        changeActiveToggle
      }}
    >
      { children }
    </StakingContext.Provider>
  )
}

export const useStaking = () => useContext(StakingContext)