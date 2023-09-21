"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { useWallet } from ".."
import { getContract, getPublicClient } from "@wagmi/core"
import { formatEther, parseAbiItem } from "viem"
import { BeraInfo, GoldilendInitialState } from "../../utils/interfaces"
import { contracts } from "../../utils/addressi"

const INITIAL_STATE: GoldilendInitialState = {
  loanAmount: 0,
  displayString: '',
  activeToggle: 'loan',
  borrowLimit: 0,
  loanExpiration: '',
  changeActiveToggle: (_toggle: string) => {},
  checkBeraBalance: async () => {},
  beraArray: [],
  selectedBeras: [],
  handleBorrowChange: (_input: string) => {},
  handleDateChange: (_input: string) => {},
  handleBeraClick: (_bera: BeraInfo) => {},
  findSelectedIdxs: () => [],
  updateBorrowLimit: () => {},
  loanPopupToggle: false,
  setLoanPopupToggle: (_bool: boolean) => {},
  eventTest: () => {}
}

const GoldilendContext = createContext(INITIAL_STATE)

export const GoldilendProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { wallet } = useWallet()

  const [loanAmountState, setLoanAmountState] = useState<number>(INITIAL_STATE.loanAmount)
  const [displayStringState, setDisplayStringState] = useState<string>(INITIAL_STATE.displayString)
  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)
  const [borrowLimitState, setBorrowLimitState] = useState<number>(INITIAL_STATE.borrowLimit)
  const [loanExpirationState, setLoanExpirationState] = useState<string>(INITIAL_STATE.loanExpiration)
  const [beraArrayState, setBeraArrayState] = useState<BeraInfo[]>(INITIAL_STATE.beraArray)
  const [selectedBerasState, setSelectedBerasState] = useState<BeraInfo[]>([])
  const [loanPopupToggleState, setLoanPopupToggleState] = useState<boolean>(INITIAL_STATE.loanPopupToggle)

  const publicClient = getPublicClient()

  const bondbearContract = getContract({
    address: contracts.bondbear.address as `0x${string}`,
    abi: contracts.bondbear.abi
  })

  const bandbearContract = getContract({
    address: contracts.bandbear.address as `0x${string}`,
    abi: contracts.bandbear.abi
  })

  const changeActiveToggle = (toggle: string) => {
    setDisplayStringState('')
    setLoanAmountState(0)
    setActiveToggleState(toggle)
  }

  const handleBorrowChange = (input: string) => {
    setDisplayStringState(input)
    !input ? setLoanAmountState(0) : setLoanAmountState(parseFloat(input))
  }

  const handleDateChange = (input: string) => {
    setLoanExpirationState(input)
  }

  const checkBeraBalance = async () => {
    let fromBlockBond = '9699688'
    let toBlockBond = '9704688'
    const currentBlock = await publicClient.getBlockNumber()
    const currentBlockNum = parseFloat(currentBlock.toString())
    const loopNum = Math.ceil((currentBlockNum - parseFloat(fromBlockBond)) / 5000)
    let beraIndex = 0
    
    for(let i = 0; i < loopNum; i++) {
      const bondFilter = await publicClient.createEventFilter({
        address: contracts.bondbear.address as `0x${string}`,
        event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
        fromBlock: BigInt(fromBlockBond),
        toBlock: BigInt(toBlockBond)
      })

      const bondLogs = await publicClient.getFilterLogs({ filter: bondFilter })
      for(let i = 0; i < bondLogs.length; i++) {
        if(bondLogs[i].args[1] === wallet) {
          const topic = bondLogs[i].topics as unknown as [string, string, string, string]
          const nftId = parseInt(topic[3], 16)
          const bondInfo  = {
            name: "BondBera",
            id: nftId,
            imageSrc: "https://ipfs.io/ipfs/QmSaVWb15oQ1HcsUjGGkjwHQ1mxJBYeivtBCgHHHiVLt7w",
            valuation: 50,
            index: beraIndex
          }
          setBeraArrayState(curr => [...curr, bondInfo])
          beraIndex++
        }
      }

      fromBlockBond = (parseFloat(fromBlockBond) + 5000).toString()
      toBlockBond = parseFloat(toBlockBond) + 5000 > currentBlockNum ?  parseFloat(currentBlock.toString()).toString() : (parseFloat(toBlockBond) + 5000).toString()
    }

    let fromBlockBand = '9699688'
    let toBlockBand = '9704688'
    for(let i = 0; i < loopNum; i++) {
      const bandFilter = await publicClient.createEventFilter({
        address: contracts.bandbear.address as `0x${string}`,
        event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
        fromBlock: BigInt(fromBlockBand),
        toBlock: BigInt(toBlockBand)
      })

      const bandLogs = await publicClient.getFilterLogs({ filter: bandFilter })
      for(let i = 0; i < bandLogs.length; i++) {
        if(bandLogs[i].args[1] === wallet) {
          const topic = bandLogs[i].topics as unknown as [string, string, string, string]
          const nftId = parseInt(topic[3], 16)
          const bandInfo  = {
            name: "BandBera",
            id: nftId,
            imageSrc: "https://ipfs.io/ipfs/QmNWggx9vvBVEHZc6xwWkdyymoKuXCYrJ3zQwwKzocDxRt",
            valuation: 50,
            index: beraIndex
          }
          setBeraArrayState(curr => [...curr, bandInfo])
          beraIndex++
        }
      }

      fromBlockBand = (parseFloat(fromBlockBand) + 5000).toString()
      toBlockBand = parseFloat(toBlockBand) + 5000 > currentBlockNum ?  parseFloat(currentBlock.toString()).toString() : (parseFloat(toBlockBand) + 5000).toString()
    }
  }
  
  const eventTest = async () => {
    console.log(beraArrayState)
  }

  const handleBeraClick = (bera: BeraInfo) => {
    const idxArray: number[] = findSelectedIdxs()
    if(idxArray.includes(bera.index)) {
      setSelectedBerasState(prev => prev.filter(beraf => beraf.index !== bera.index))
    }
    else {
      setSelectedBerasState(prev => [...prev, bera])
    }
  }

  const findSelectedIdxs = (): number[] => {
    let idxArray: number[] = []
    selectedBerasState.forEach((selectedBera) => {
      idxArray.push(selectedBera.index)
    })
    return idxArray
  }

  const updateBorrowLimit = () => {
    let limit = 0
    selectedBerasState.forEach((bera) => {
      limit += bera.valuation
    })
    setBorrowLimitState(limit)
  }

  return (
    <GoldilendContext.Provider
      value={{
        loanAmount: loanAmountState,
        displayString: displayStringState,
        activeToggle: activeToggleState,
        borrowLimit: borrowLimitState,
        loanExpiration: loanExpirationState,
        beraArray: beraArrayState,
        selectedBeras: selectedBerasState,
        loanPopupToggle: loanPopupToggleState,
        setLoanPopupToggle: setLoanPopupToggleState,
        changeActiveToggle,
        checkBeraBalance,
        handleBorrowChange,
        handleDateChange,
        updateBorrowLimit,
        handleBeraClick,
        findSelectedIdxs,
        eventTest
      }}
    >
      { children }
    </GoldilendContext.Provider>
  )
}

export const useGoldilend = () => useContext(GoldilendContext)