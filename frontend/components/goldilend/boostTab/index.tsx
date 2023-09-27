"use client"

import { useEffect, useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useGoldilend, useNotification } from "../../../providers"
import { useGoldilendTx } from "../../../hooks/goldilend"
import { contracts } from "../../../utils/addressi"

export const BoostTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)
  const [extendInput, setExtendInput] = useState<boolean>(false)
  const [newExpiration, setNewExpiration] = useState<string>('')

  const { 
    goldilendInfo,
    ownedPartners,
    selectedPartners,
    getOwnedPartners,
    findBoost,
    findSelectedPartnerIdxs,
    handlePartnerClick,
    boostExpiration,
    handleBoostDateChange,
    clearOutBoostInputs
  } = useGoldilend()

  const { 
    checkBoostAllowance,
    sendGoldilendNFTApproveTx,
    sendBoostTx,
    sendExtendBoostTx,
    sendWithdrawBoostTx
  } = useGoldilendTx()

  const { openNotification } = useNotification()

  useEffect(() => {
    getOwnedPartners()
    findBoost()    
    setInfoLoading(false)
  }, [])

  const loadingElement = () => {
    return <span className="loader-small mx-auto"></span>
  }

  const refreshInfo = () => {
    getOwnedPartners()
    findBoost()
    setNewExpiration('')
    clearOutBoostInputs()
  }

  const parseDate = (dateString: string): number => {
    const dateParts = dateString.split('-')
    const [month, day, year] = dateParts.map(Number);
    const parsedDate = new Date(year, month - 1, day)
    const timestamp = parsedDate.getTime()
    const timestampDigits = Math.floor(timestamp / 1000)
    return timestampDigits
  }

  const checkDate = (dateString: String): boolean => {
    const dateParts = dateString.split('-')
    const [month, day, year] = dateParts.map(Number)
    const parsedDate = new Date(year, month - 1, day)
    const timestamp = parsedDate.getTime()
    const timestampDigits = Math.floor(timestamp / 1000)
    if(dateParts.length !== 3) {
      return false
    }
    if (isNaN(month) || isNaN(day) || isNaN(year)) {
      return false
    }
    if (isNaN(parsedDate.getTime())) {
      return false
    }
    if(timestampDigits < Math.floor(Date.now() / 1000)) {
      return false
    }
    if(timestampDigits < goldilendInfo.userBoost.expiry + (86400 * 30)) {
      return false
    }
    return true
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = String(date.getFullYear())
    return `${month}-${day}-${year}`
  }

  const renderButton = () => {
    return 'create boost'
  }

  const handleBoostButtonClick = async () => {
    const button = document.getElementById('boost-button')
    if(!checkDate(boostExpiration)) {
      button && (button.innerHTML = "invalid expiration date")
      return
    }
    if(selectedPartners.length == 0) {
      button && (button.innerHTML = "no collateral")
      return
    }
    const [combFlag, beraFlag] = await checkBoostAllowance()
    if(combFlag && beraFlag) {
      button && (button.innerHTML = "boosting...")
      const boostTx = await sendBoostTx(selectedPartners, parseDate(boostExpiration))
      boostTx && openNotification({
        title: 'Successfully Boosted!',
        hash: boostTx,
        direction: 'boosted',
        amount: 0,
        price: 0,
        page: 'boost'
      })
      button && (button.innerHTML = "create boost")
      refreshInfo()
    }
    else {
      button && (button.innerHTML = "approving...")
      if(!combFlag) {
        await sendGoldilendNFTApproveTx(contracts.honeycomb.address)
      }
      if(!beraFlag) {
        await sendGoldilendNFTApproveTx(contracts.beradrome.address)
      }
      setTimeout(() => {
        button && (button.innerHTML = "create boost")
      }, 10000)
    }
  }

  const handleExtendButtonClick = async () => {
    const button = document.getElementById('extend-boost-button')
    
    if(extendInput) {
      if(newExpiration === '') {
        setExtendInput(false)
      }
      else {
        if(!checkDate(newExpiration)) {
          button && (button.innerHTML = "invalid date")
          return
        }
        button && (button.innerHTML = "extending...")
        await sendExtendBoostTx(parseDate(newExpiration))
        button && (button.innerHTML = "extend")
        setExtendInput(false)
        refreshInfo()
      }
    }
    else {
      setExtendInput(true)
    }
  }

  const handleWithdrawButtonClick = async () => {
    const button = document.getElementById('withdraw-boost-button')
    if(goldilendInfo.userBoost.expiry > Math.floor(Date.now() / 1000)) {
      button && (button.innerHTML = "not expired")
      return
    }
    else {
      button && (button.innerHTML = "withdrawing...")
      await sendWithdrawBoostTx()
      button && (button.innerHTML = "withdraw")
      refreshInfo()
    }
  }

  return (
    <div className="w-[100%] h-[95%] flex flex-row justify-between">
      <div className="h-[97.5%] mt-[2.5%] w-[67.5%] flex flex-col py-4 px-6 border-2 border-black rounded-xl bg-white">
        <h1 className="font-acme pb-4 text-[24px] 2xl:text-[30px]">create boost</h1>
        <div className="pl-2 h-[70%] w-[100%] flex flex-col justify-between font-acme">
          <div className="w-[100%] h-[33%]">
            <h2 className="text-[18px] 2xl:text-[24px]">expiration</h2>
            {/* todo: add actual calendar select */}
            <input
              className="w-[90%] h-[50%] border-none focus:outline-none pl-4 text-[18px] 2xl:text-[24px]"
              type="text"
              id="number-input"
              placeholder="mm-dd-yyyy"
              value={boostExpiration}
              onChange={(e) => handleBoostDateChange(e.target.value)}
            />
          </div>
          <div className="w-[100%] h-[33%]">
            <h2 className="text-[18px] 2xl:text-[24px]">collateral</h2>
            <div className="flex flex-row w-[100%] pl-4">
              {
                selectedPartners.map((partner, index) => (
                  <div key={index} className="w-[10%] py-2">
                    {
                      partner.name === 'Beradrome' ?
                        <img
                          className="ml-[5%] w-[90%] rounded-xl hover:scale-110 hover:cursor-pointer"
                          onClick={() => handlePartnerClick(partner)}
                          src={partner.imageSrc}
                          alt="partner"
                          id="home-button"
                        />
                      :
                        <video
                          className="ml-[5%] w-[90%] rounded-xl hover:scale-110 hover:cursor-pointer"
                          onClick={() => handlePartnerClick(partner)}
                          id="home-button"
                          autoPlay
                          loop
                          muted
                        >
                          <source src={partner.imageSrc} type="video/mp4" />
                        </video>
                    }
                  </div>
                ))
              }
            </div>
          </div>
          <div className="w-[100%] h-[33%]">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openConnectModal,
                openChainModal
              }) => {
                return (
                  <button
                    className="h-[60%] w-[50%] mt-[2.5%] ml-[50%] rounded-xl px-4 2xl:px-6 border-2 border-black font-acme text-[20px] 2xl:text-[24px]"
                    id="boost-button"
                    onClick={() => {
                      const button = document.getElementById('boost-button')

                      if(!account) {
                        if(button && button.innerHTML === "connect wallet") {
                          openConnectModal()
                        }
                        else {
                          button && (button.innerHTML = "connect wallet")
                        }
                      }
                      else if(chain?.name !== "Goerli test network") {
                        if(button && button.innerHTML === "switch to goerli plz") {
                          openChainModal()
                        }
                        else {
                          button && (button.innerHTML = "switch to goerli plz")
                        }
                      }
                      else {
                        handleBoostButtonClick()
                      }
                    }}
                  >
                    {renderButton()}
                  </button>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </div>
        <div className="w-[100%] h-[30%]">
          <h2 className="font-acme h-[28.5%] text-[18px] 2xl:text-[24px] border-2 border-b-black border-t-white border-l-white border-r-white mb-2">your boost</h2>
            {
              goldilendInfo.userBoost.partnerNFTs.length > 0 &&
              <div className="w-[100%] h-[72.5%] flex flex-row">
                <div className="h-[100%] w-[25%] flex flex-col justify-center font-acme">
                  <p className="text-[20px] ml-2">magnitude</p>
                  <p className="ml-4">{goldilendInfo.userBoost.boostMagnitude}</p>
                  <p className="text-[20px] ml-2">expiration</p>
                  <p className="ml-4">{formatDate(goldilendInfo.userBoost.expiry)}</p>
                </div>
                <div className="h-[100%] w-[50%] flex flex-row items-center overflow-x-auto" id="hide-scrollbar">
                  {
                    goldilendInfo.userBoost.partnerNFTs.map((nft) => (
                      nft.toLowerCase() === contracts.beradrome.address.toLowerCase() ?
                      <img
                        className={`ml-[5%] h-[81%] w-[${goldilendInfo.userBoost.partnerNFTs.length > 2 ? "45" : "29"}%] rounded-xl`}
                        src="https://ipfs.io/ipfs/QmYhKPJVDZDRDpJAJ2TyCXK981B4pvtPcjrKgN256U4Cok/73.png"
                        alt="nft"
                        id="home-button"
                      />
                    :
                      <video
                        className={`ml-[5%] h-[81%] w-[${goldilendInfo.userBoost.partnerNFTs.length > 2 ? "45" : "29"}%] rounded-xl`}
                        id="home-button"
                        autoPlay
                        loop
                        muted
                      >
                        <source src="https://ipfs.io/ipfs/QmTffyDuYgSyFAgispVjuVaTsKnC5vVs7FFq1YkGde4ZX5" type="video/mp4" />
                      </video>
                    ))
                  }
                </div>
                <div className="h-[100%] w-[25%] flex flex-col justify-around items-center font-acme">
                  <button
                    className="w-[90%] h-[35%] rounded-xl border-2 border-black hover:scale-110 hover:cursor-pointer"
                    id="extend-boost-button"
                    onClick={() => handleExtendButtonClick()}
                  >
                    extend
                  </button>
                  {
                    extendInput ?
                      <input
                        className="w-[90%] h-[35%] border-none focus:outline-none pl-2"
                        type="text"
                        id="number-input"
                        placeholder="mm-dd-yyyy"
                        value={newExpiration}
                        onChange={(e) => setNewExpiration(e.target.value)}
                      /> 
                    :
                      <button
                        className="w-[90%] h-[35%] rounded-xl border-2 border-black hover:scale-110 hover:cursor-pointer"
                        id="withdraw-boost-button"
                        onClick={() => handleWithdrawButtonClick()}
                      >
                        withdraw
                      </button>
                  }
                </div>
              </div>
            }
        </div>
      </div>
      <div className="h-[97.5%] mt-[2.5%] w-[30%] flex flex-col px-2 border-2 border-black rounded-xl bg-white">
        <h1 className="font-acme mx-auto underline py-4 text-[18px] 2xl:text-[24px]">your partner nfts</h1>
        {
          infoLoading ? loadingElement() :
          <div className="flex flex-wrap overflow-y-auto h-[90%]" id="hide-scrollbar">
            {
              ownedPartners.map((partner, index) => (
                <div key={index} className="h-[30%] w-[50%] py-2">
                  {
                    partner.name === 'Beradrome' ?
                      <img
                        className={`ml-[5%] w-[90%] rounded-xl hover:scale-110 hover:cursor-pointer ${findSelectedPartnerIdxs().includes(partner.index) ? "border-4 border-black" : "opacity-75"}`}
                        onClick={() => handlePartnerClick(partner)}
                        src={partner.imageSrc}
                        alt="partner"
                        id="home-button"
                      /> 
                    :
                      <video 
                        className={`ml-[5%] w-[90%] rounded-xl hover:scale-110 hover:cursor-pointer ${findSelectedPartnerIdxs().includes(partner.index) ? "border-4 border-black" : "opacity-75"}`}
                        onClick={() => handlePartnerClick(partner)}
                        id="home-button"
                        autoPlay
                        loop 
                        muted
                      >
                        <source src={partner.imageSrc} type="video/mp4" />
                      </video>
                  }
                  </div>
              ))
            }
          </div>
        }
      </div>
    </div>
  )
}