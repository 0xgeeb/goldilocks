"use client"

import { useEffect, useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useGoldilendTx } from "../../../hooks/goldilend"
import { useGoldilend, useWallet } from "../../../providers"
import { contracts } from "../../../utils/addressi"

export const LoanTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  const {
    goldilendInfo,
    getOwnedBeras,
    ownedBeras,
    selectedBeras,
    loanAmount,
    displayString,
    borrowLimit,
    loanExpiration,
    handleBorrowChange,
    handleLoanDateChange,
    handleBeraClick,
    findSelectedBeraIdxs,
    updateBorrowLimit,
    loanPopupToggle,
    setLoanPopupToggle,
  } = useGoldilend()

  const {
    checkLoanAllowance,
    sendGoldilendNFTApproveTx
  } = useGoldilendTx()
  
  const { isConnected }  = useWallet()

  useEffect(() => {
    getOwnedBeras()
    setInfoLoading(false)
  }, [isConnected])

  useEffect(() => {
    updateBorrowLimit()
  }, [selectedBeras])

  const loadingElement = () => {
    return <span className="loader-small mx-auto"></span>
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
    if(timestampDigits < Math.floor(Date.now() / 1000) + (86400 * 14)) {
      return false
    }
    return true
  }

  const checkSelected = (beraName: string): boolean => {
    for(let i = 0; i < selectedBeras.length; i++) {
      if(selectedBeras[i].name === beraName) {
        return true
      }
    }
    
    return false
  }

  const renderButton = () => {
    return 'create loan'
  }

  const handleButtonClick = async () => {
    const button = document.getElementById('amm-button')
    if(loanPopupToggle) {
      return
    }
    if(loanAmount == 0) {
      button && (button.innerHTML = "empty loan")
      return
    }
    if(loanAmount > borrowLimit) {
      button && (button.innerHTML = "insufficient limit")
      return
    }
    if(!checkDate(loanExpiration)) {
      button && (button.innerHTML = "invalid expiration date")
      return
    }
    if(selectedBeras.length == 0) {
      button && (button.innerHTML = "no collateral")
      return
    }
    const [bondFlag, bandFlag] = await checkLoanAllowance()
    if((bondFlag || !checkSelected("BondBera")) && (bandFlag || !checkSelected("BandBera"))) {
      button && (button.innerHTML = "create loan")
      setLoanPopupToggle(true)
    }
    else {
      button && (button.innerHTML = "approving...")
      if(!bondFlag && checkSelected('BondBera')) {
        await sendGoldilendNFTApproveTx(contracts.bondbear.address)
      }
      if(!bandFlag && checkSelected('BandBera')) {
        await sendGoldilendNFTApproveTx(contracts.bandbear.address)
      }
      setTimeout(() => {
        button && (button.innerHTML = "create loan")
      }, 10000)
    }
  }

  return (
    <div className="w-[100%] h-[95%] flex flex-row justify-between">
      <div className="h-[97.5%] mt-[2.5%] w-[67.5%] flex flex-col py-4 px-6 bg-white border-2 border-black rounded-xl">
        <h1 className="font-acme pb-4 text-[24px] 2xl:text-[30px]">create loan</h1>
        <div className="pl-2 h-[80%] w-[100%] flex flex-col justify-between font-acme">
          <div className="w-[100%] h-[33%] relative">
            <h2 className="text-[18px] 2xl:text-[24px]">loan amount</h2>
            <input
              className="w-[90%] h-[50%] border-none focus:outline-none pl-4 text-[18px] 2xl:text-[24px]"
              type="number"
              id="number-input"
              placeholder="0.00"
              value={displayString}
              onChange={(e) => handleBorrowChange(e.target.value)}
            />
            <h2 className="absolute right-0 text-[14px] 2xl:text-[18px]">borrow limit: {borrowLimit > 0 ? borrowLimit : "0.00"}</h2>
          </div>
          <div className="w-[100%] h-[33%]">
            <h2 className="text-[18px] 2xl:text-[24px]">expiration</h2>
            {/* todo: add actual calendar select */}
            <input
              className="w-[90%] h-[50%] border-none focus:outline-none pl-4 text-[18px] 2xl:text-[24px]"
              type="text"
              id="number-input"
              placeholder="mm-dd-yyyy"
              value={loanExpiration}
              onChange={(e) => handleLoanDateChange(e.target.value)}
            />
          </div>
          <div className="w-[100%] h-[33%]">
            <h2 className="text-[18px] 2xl:text-[24px]">collateral</h2>
            <div className="flex flex-row w-[100%] pl-4">
              {
                selectedBeras.map((bera, index) => (
                  <div key={index} className="w-[10%] py-2">
                    <img
                      className="ml-[5%] w-[90%] rounded-xl hover:scale-110 hover:cursor-pointer"
                      onClick={() => handleBeraClick(bera)}
                      src={bera.imageSrc}
                      alt="bera"
                      id="home-button"
                    />
                  </div>
                ))
              }
            </div>
          </div>
        </div>
        <div className="w-[100%] h-[20%]">
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
      <div className="h-[97.5%] mt-[2.5%] w-[30%] flex flex-col border-2 border-black rounded-xl bg-white px-2">
        <h1 className="font-acme mx-auto underline py-4 text-[18px] 2xl:text-[24px]">your beras</h1>
        { 
          infoLoading ? loadingElement() : 
          <div className="flex flex-wrap overflow-y-auto h-[90%]" id="hide-scrollbar">
            {
              ownedBeras.map((bera, index) => (
                <div key={index} className="h-[30%] w-[50%] py-2">
                  <img
                    className={`ml-[5%] w-[90%] rounded-xl hover:scale-110 hover:cursor-pointer ${findSelectedBeraIdxs().includes(bera.index) ? "border-4 border-black" : "opacity-75"}`}
                    onClick={() => handleBeraClick(bera)}
                    src={bera.imageSrc}
                    alt="bera"
                    id="home-button"
                  />
                </div>
              ))
            }
          </div> 
        }
      </div>
    </div>
  )
}