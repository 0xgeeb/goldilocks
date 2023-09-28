"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { useWallet } from ".."
import { getContract, getPublicClient } from "@wagmi/core"
import { formatEther, parseAbiItem } from "viem"
import { BeraInfo, PartnerInfo, GoldilendInitialState, GoldilendInfo, BoostData } from "../../utils/interfaces"
import { contracts } from "../../utils/addressi"

const INITIAL_STATE: GoldilendInitialState = {
  goldilendInfo: {
    userBoost: {
      partnerNFTs: [],
      partnerNFTIds: [],
      boostMagnitude: 0,
      expiry: 0
    }
  },
  loanAmount: 0,
  borrowLimit: 0,
  displayString: '',
  activeToggle: 'loan',
  loanExpiration: '',
  boostExpiration: '',
  changeActiveToggle: (_toggle: string) => {},
  getOwnedBeras: async () => {},
  getOwnedPartners: async () => {},
  findBoost: async () => {},
  ownedBeras: [],
  ownedPartners: [],
  selectedBeras: [],
  selectedPartners: [],
  handleBorrowChange: (_input: string) => {},
  handleLoanDateChange: (_input: string) => {},
  handleBoostDateChange: (_input: string) => {},
  handleBeraClick: (_bera: BeraInfo) => {},
  handlePartnerClick: (_partner: PartnerInfo) => {},
  findSelectedBeraIdxs: () => [],
  findSelectedPartnerIdxs: () => [],
  updateBorrowLimit: () => {},
  loanPopupToggle: false,
  setLoanPopupToggle: (_bool: boolean) => {},
  clearOutBoostInputs: () => {}
}

const GoldilendContext = createContext(INITIAL_STATE)

export const GoldilendProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { wallet } = useWallet()

  const [goldilendInfoState, setGoldilendInfoState] = useState<GoldilendInfo>(INITIAL_STATE.goldilendInfo)
  const [loanAmountState, setLoanAmountState] = useState<number>(INITIAL_STATE.loanAmount)
  const [displayStringState, setDisplayStringState] = useState<string>(INITIAL_STATE.displayString)
  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)
  const [borrowLimitState, setBorrowLimitState] = useState<number>(INITIAL_STATE.borrowLimit)
  const [loanExpirationState, setLoanExpirationState] = useState<string>(INITIAL_STATE.loanExpiration)
  const [boostExpirationState, setBoostExpirationState] = useState<string>(INITIAL_STATE.boostExpiration)
  const [ownedBerasState, setOwnedBerasState] = useState<BeraInfo[]>(INITIAL_STATE.ownedBeras)
  const [ownedPartnersState, setOwnedPartnersState] = useState<PartnerInfo[]>(INITIAL_STATE.ownedPartners)
  const [selectedBerasState, setSelectedBerasState] = useState<BeraInfo[]>([])
  const [selectedPartnersState, setSelectedPartnersState] = useState<PartnerInfo[]>([])
  const [loanPopupToggleState, setLoanPopupToggleState] = useState<boolean>(INITIAL_STATE.loanPopupToggle)

  const publicClient = getPublicClient()

  const goldilendContract = getContract({
    address: contracts.goldilend.address as `0x${string}`,
    abi: contracts.goldilend.abi
  })

  const changeActiveToggle = (toggle: string) => {
    setDisplayStringState('')
    setLoanAmountState(0)
    setLoanExpirationState('')
    setBoostExpirationState('')
    setSelectedBerasState([])
    setSelectedPartnersState([])
    setActiveToggleState(toggle)
  }

  const clearOutBoostInputs = () => {
    setSelectedPartnersState([])
    setBoostExpirationState('')
  }

  const handleBorrowChange = (input: string) => {
    setDisplayStringState(input)
    !input ? setLoanAmountState(0) : setLoanAmountState(parseFloat(input))
  }

  const handleLoanDateChange = (input: string) => {
    setLoanExpirationState(input)
  }

  const handleBoostDateChange = (input: string) => {
    setBoostExpirationState(input)
  }

  const getOwnedBeras = async () => {
    if(!wallet) {
      return
    }
    if(ownedBerasState.length > 0) {
      return
    }
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
          setOwnedBerasState(curr => [...curr, bondInfo])
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
          setOwnedBerasState(curr => [...curr, bandInfo])
          beraIndex++
        }
      }

      fromBlockBand = (parseFloat(fromBlockBand) + 5000).toString()
      toBlockBand = parseFloat(toBlockBand) + 5000 > currentBlockNum ?  parseFloat(currentBlock.toString()).toString() : (parseFloat(toBlockBand) + 5000).toString()
    }
  }

  const getOwnedPartners = async () => {
    if(!wallet) {
      return
    }
    if(ownedPartnersState.length > 0) {
      return
    }
    const step = 5000
    let fromBlockComb = '9699688'
    let toBlockComb = (parseFloat(fromBlockComb) + step).toString()
    const currentBlock = await publicClient.getBlockNumber()
    const currentBlockNum = parseFloat(currentBlock.toString())
    const loopNum = Math.ceil((currentBlockNum - parseFloat(fromBlockComb)) / step)
    let partnerIndex = 0

    for(let i = 0; i < loopNum; i++) {
      const combFilter = await publicClient.createEventFilter({
        address: contracts.honeycomb.address as `0x${string}`,
        event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
        fromBlock: BigInt(fromBlockComb),
        toBlock: BigInt(toBlockComb)
      })

      const combLogs = await publicClient.getFilterLogs({ filter: combFilter })
      for(let i = 0; i < combLogs.length; i++) {
        if(combLogs[i].args[1] === wallet) {
          const topic = combLogs[i].topics as unknown as [string, string, string, string]
          const nftId = parseInt(topic[3], 16)
          const combInfo  = {
            name: "HoneyComb",
            id: nftId,
            imageSrc: "https://ipfs.io/ipfs/QmTffyDuYgSyFAgispVjuVaTsKnC5vVs7FFq1YkGde4ZX5",
            boost: 6,
            index: partnerIndex
          }
          setOwnedPartnersState(curr => [...curr, combInfo])
          partnerIndex++
        }
      }

      fromBlockComb = (parseFloat(fromBlockComb) + 5000).toString()
      toBlockComb =  parseFloat(toBlockComb) + 5000 > currentBlockNum ?  parseFloat(currentBlock.toString()).toString() : (parseFloat(toBlockComb) + 5000).toString()
    }

    let fromBlockDrome = '9699688'
    let toBlockDrome = (parseFloat(fromBlockDrome) + step).toString()
    for(let i = 0; i < loopNum; i++) {
      const dromeFilter = await publicClient.createEventFilter({
        address: contracts.bandbear.address as `0x${string}`,
        event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
        fromBlock: BigInt(fromBlockDrome),
        toBlock: BigInt(toBlockDrome)
      })

      const dromeLogs = await publicClient.getFilterLogs({ filter: dromeFilter })
      for(let i = 0; i < dromeLogs.length; i++) {
        if(dromeLogs[i].args[1] === wallet) {
          const topic = dromeLogs[i].topics as unknown as [string, string, string, string]
          const nftId = parseInt(topic[3], 16)
          const dromeInfo  = {
            name: "Beradrome",
            id: nftId,
            imageSrc: "https://ipfs.io/ipfs/QmYhKPJVDZDRDpJAJ2TyCXK981B4pvtPcjrKgN256U4Cok/73.png",
            boost: 9,
            index: partnerIndex
          }
          setOwnedPartnersState(curr => [...curr, dromeInfo])
          partnerIndex++
        }
      }

      fromBlockDrome = (parseFloat(fromBlockDrome) + 5000).toString()
      toBlockDrome = parseFloat(toBlockDrome) + 5000 > currentBlockNum ?  parseFloat(currentBlock.toString()).toString() : (parseFloat(toBlockDrome) + 5000).toString()
    }
  }

  const findBoost = async () => {
    if(!wallet) {
      return
    }
    const boost = await goldilendContract.read.lookupBoost([wallet])
    const boosted = boost as unknown as BoostData
    const userBoost = {
      partnerNFTs: boosted.partnerNFTs,
      partnerNFTIds: boosted.partnerNFTIds.map(id => parseInt(id.toString(), 16)),
      boostMagnitude: parseInt(boosted.boostMagnitude.toString(), 16),
      expiry: Number(boosted.expiry)
    }
    setGoldilendInfoState({ userBoost })
  }

  const handleBeraClick = (bera: BeraInfo) => {
    const idxArray: number[] = findSelectedBeraIdxs()
    if(idxArray.includes(bera.index)) {
      setSelectedBerasState(prev => prev.filter(beraf => beraf.index !== bera.index))
    }
    else {
      setSelectedBerasState(prev => [...prev, bera])
    }
  }

  const handlePartnerClick = (partner: PartnerInfo) => {
    const idxArray: number[] = findSelectedPartnerIdxs()
    if(idxArray.includes(partner.index)) {
      setSelectedPartnersState(prev => prev.filter(partnerf => partnerf.index !== partner.index))
    }
    else {
      setSelectedPartnersState(prev => [...prev, partner])
    }
  }

  const findSelectedBeraIdxs = (): number[] => {
    let idxArray: number[] = []
    selectedBerasState.forEach((selectedBera) => {
      idxArray.push(selectedBera.index)
    })
    return idxArray
  }

  const findSelectedPartnerIdxs = (): number[] => {
    let idxArray: number[] = []
    selectedPartnersState.forEach((selectedPartner) => {
      idxArray.push(selectedPartner.index)
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
        goldilendInfo: goldilendInfoState,
        loanAmount: loanAmountState,
        displayString: displayStringState,
        activeToggle: activeToggleState,
        borrowLimit: borrowLimitState,
        loanExpiration: loanExpirationState,
        boostExpiration: boostExpirationState,
        ownedBeras: ownedBerasState,
        ownedPartners: ownedPartnersState,
        selectedBeras: selectedBerasState,
        selectedPartners: selectedPartnersState,
        loanPopupToggle: loanPopupToggleState,
        setLoanPopupToggle: setLoanPopupToggleState,
        changeActiveToggle,
        getOwnedBeras,
        getOwnedPartners,
        findBoost,
        handleBorrowChange,
        handleLoanDateChange,
        handleBoostDateChange,
        updateBorrowLimit,
        handleBeraClick,
        handlePartnerClick,
        findSelectedBeraIdxs,
        findSelectedPartnerIdxs,
        clearOutBoostInputs
      }}
    >
      { children }
    </GoldilendContext.Provider>
  )
}

export const useGoldilend = () => useContext(GoldilendContext)