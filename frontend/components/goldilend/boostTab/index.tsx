"use client"

import { useEffect, useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useGoldilend } from "../../../providers"
import { useGoldilendTx } from "../../../hooks/goldilend"
import { contracts } from "../../../utils/addressi"

export const BoostTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)
  const [dateError, setDateError] = useState<boolean>(false)

  const { 
    ownedPartners,
    selectedPartners,
    getOwnedPartners,
    findBoost,
    findSelectedPartnerIdxs,
    handlePartnerClick,
    boostExpiration,
    handleBoostDateChange
  } = useGoldilend()

  const { 
    checkBoostAllowance,
    sendGoldilendNFTApproveTx,
    sendBoostTx
  } = useGoldilendTx()

  useEffect(() => {
    // getOwnedPartners()
    findBoost()
    setInfoLoading(false)
  }, [])

  const loadingElement = () => {
    return <span className="loader-small mx-auto"></span>
  }

  const parseDate = (dateString: string): number => {
    const dateParts = dateString.split('-')
    const [month, day, year] = dateParts.map(Number);
    const parsedDate = new Date(year, month - 1, day)
    const timestamp = parsedDate.getTime()
    const timestampDigits = Math.floor(timestamp / 1000)
    return timestampDigits
  }

  const renderButton = () => {
    return 'create boost'
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
    if(timestampDigits < Math.floor(Date.now() / 1000) + (86400 * 30)) {
      return false
    }
    return true
  }

  const handleButtonClick = async () => {
    const button = document.getElementById('amm-button')
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
                    id="amm-button"
                    onClick={() => {
                      const button = document.getElementById('amm-button')

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
                        handleButtonClick()
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
          <h2 className="font-acme text-[18px] 2xl:text-[24px]">your boost</h2>
            {

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