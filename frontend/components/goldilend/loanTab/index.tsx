"use client"

import { useEffect, useState } from "react"
import { useGoldilend, useWallet } from "../../../providers"

export const LoanTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  const {
    checkBeraBalance,
    beraArray,
    selectedBeras,
    displayString,
    borrowLimit,
    handleBorrowChange,
    handleBeraClick,
    findSelectedIdxs,
    updateBorrowLimit,
  } = useGoldilend()
  const { isConnected }  = useWallet()

  useEffect(() => {
    checkBeraBalance()
    setInfoLoading(false)
  }, [isConnected])

  useEffect(() => {
    updateBorrowLimit()
  }, [selectedBeras])

  const loadingElement = () => {
    return <span className="loader-small mx-auto"></span>
  }

  const test = () => {
    console.log(borrowLimit)
    console.log(selectedBeras)
  }

  return (
    <div className="w-[100%] h-[100%] flex flex-row justify-between" onClick={() => test()}>
      <div className="h-[97.5%] mt-[2.5%] w-[67.5%] flex flex-col py-4 px-6 bg-white border-2 border-black rounded-xl">
        <h1 className="font-acme text-[20px] 2xl:text-[26px]">create loan</h1>
        <div className="bg-green-400 h-[80%] w-[100%] flex flex-col justify-between font-acme">
          <div className="w-[100%] h-[33%]">
            <h2 className="text-[18px] 2xl:text-[24px]">borrowed amount</h2>
            <input
              className="w-[90%] h-[50%] border-none focus:outline-none pl-4 text-[18px] 2xl:text-[24px]"
              type="number"
              id="number-input"
              placeholder="0.00"
              value={displayString}
              onChange={(e) => handleBorrowChange(e.target.value)}
            />
            <h2 className="text-[18px] 2xl:text-[24px]">borrow limit: {borrowLimit ?? "0.00"}</h2>
          </div>
          <div className="w-[100%] h-[33%]">
            <h2 className="text-[18px] 2xl:text-[24px]">duration</h2>
          </div>
          <div className="w-[100%] h-[33%]">
            <h2 className="text-[18px] 2xl:text-[24px]">collateral</h2>
            <div className="flex flex-row w-[100%]">
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
      </div>
      <div className="h-[97.5%] mt-[2.5%] w-[30%] flex flex-col border-2 border-black rounded-xl bg-white px-2">
        <h1 className="font-acme mx-auto underline py-4 text-[18px] 2xl:text-[24px]">your beras</h1>
        { 
          infoLoading ? loadingElement() : 
          <div className="flex flex-wrap overflow-y-auto h-[90%]" id="hide-scrollbar">
            {
              beraArray.map((bera, index) => (
                <div key={index} className="w-[50%] py-2">
                  <img
                    className={`ml-[5%] w-[90%] rounded-xl hover:scale-110 hover:cursor-pointer ${findSelectedIdxs().includes(index) ? "border-4 border-black" : "opacity-75"}`}
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