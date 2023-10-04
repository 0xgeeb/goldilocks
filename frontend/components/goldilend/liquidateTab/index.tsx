"use client"

import { useEffect, useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useGoldilend, useNotification } from "../../../providers"
import { useGoldilendTx } from "../../../hooks/goldilend"


export const LiquidateTab = () => {

  const {
    goldilendInfo,
    findLoan
  } = useGoldilend()

  const [searchToggle, setSearchToggle] = useState<boolean>(true)
  const [searchAddy, setSearchAddy] = useState<string>('')
  const [searchId, setSearchId] = useState<string>('')

  const searchLoan = () => {
    findLoan(searchAddy, parseFloat(searchId))
  }

  return (
    <div className="h-[95%] mt-[2.5%] w-[100%] flex flex-col py-4 px-6 border-2 border-black rounded-xl bg-white font-acme">
      <h1 onClick={() => console.log(goldilendInfo)} className="pb-4 text-[24px] 2xl:text-[30px]">liquidate a loan</h1>
      {
        searchToggle ?
          <div className="h-[50%] w-[100%] flex flex-col items-center">
            <h1 className="text-[20px] 2xl:text-[26px]">loan search</h1>
            <div className="flex flex-col w-[100%] h-[40%] mt-[2%] justify-between items-center">
              <input 
                className="w-[40%] h-[40%] focus:outline-none pl-4 rounded-xl border-2 border-black"
                type="text"
                placeholder="0x0000000000000000000000000000000000000000"
                value={searchAddy}
                onChange={(e) => setSearchAddy(e.target.value)}
              />
              <input 
                className="w-[40%] h-[40%] focus:outline-none pl-4 rounded-xl border-2 border-black"
                type="text"
                id="number-input"
                placeholder="loan id"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <button
              className="h-[20%] w-[25%] mt-[2%] rounded-xl px-4 2xl:px-6 border-2 border-black hover:scale-110"
              id="search-button"
              onClick={() => searchLoan()}
            >
              search
            </button>
          </div> :
          <div></div>
      }
    </div>
  )
}