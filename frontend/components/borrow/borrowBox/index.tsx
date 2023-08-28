"use client"

import { useState, useEffect } from "react"
import { BorrowButton, PercentageButtons } from "../../borrow"
import { useWallet, useBorrowing } from "../../../providers"

export const BorrowBox = () => {

  const [balanceLoading, setBalanceLoading] = useState<boolean>(true)

  const {
    activeToggle,
    renderLabel,
    handleChange,
    displayString,
    handleBalance
  } = useBorrowing()
  
  const {
    isConnected,
    refreshBalances
  } = useWallet()

  const loadingElement = () => {
    return <span className="loader ml-6"></span>
  }

  useEffect(() => {
    refreshBalances()
    setBalanceLoading(false)
  }, [isConnected])

  return (
    <div className="flex flex-col w-[55%]">
      <div className="bg-white border-2 border-black rounded-xl h-[60%] relative">
        <div className="flex flex-row justify-between items-center ml-8 2xl:ml-10 mt-10 2xl:mt-16">
          <h1 className="font-acme text-[34px] 2xl:text-[40px]">{renderLabel()}</h1>
          <PercentageButtons />
        </div>
        <div className="absolute top-[45%]">
          <input 
            className="border-none focus:outline-none font-acme rounded-xl text-[34px] 2xl:text-[40px] pl-8 2xl:pl-12 w-[80%]" 
            placeholder="0.00"
            type="number"
            value={displayString} 
            onChange={(e) => handleChange(e.target.value)} 
            id="number-input" 
            autoFocus 
          />
        </div>
        <div className="absolute right-0 bottom-[35%]">
          <h1 
            className="text-[18px] 2xl:text-[23px] mr-3 font-acme text-[#878d97]"
          >
            {activeToggle === 'borrow' ? 'borrow limit: ' : 'borrowed $honey: '} {balanceLoading ? loadingElement() : handleBalance()}
          </h1>
        </div>
      </div>
      <BorrowButton />
    </div>
  )
}