"use client"

import { useState } from "react"
import { RedeemPopup } from "../../gamm"
import { ActiveToggleProps } from "../../../utils/interfaces"

export const TitleBar = ({ activeToggle, setActiveToggle }: ActiveToggleProps) => {

const [slippageToggle, setSlippageToggle] = useState<boolean>(false)
const [popupToggle, setPopupToggle] = useState<boolean>(false)

const test = () => {
  console.log('this test')
}

  return (
    <>
      <RedeemPopup popupToggle={popupToggle} setPopupToggle={setPopupToggle}/>
      <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline" onClick={() => test()} >goldilocks AMM</h1>
      <div className="flex flex-row ml-2 items-center justify-between">
        <h3 className="font-acme text-[24px] ml-2">trading between $honey & $locks</h3>
        <div className="flex flex-row items-center">
          <h1 className="mr-4 text-[28px] hover:opacity-25 hover:cursor-pointer" onClick={() => setSlippageToggle(true)}>⚙️</h1>
          <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
            <div className={`font-acme w-24 py-2 ${activeToggle === 'buy' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => setActiveToggle('buy')}>buy</div>
            <div className={`font-acme w-24 py-2 ${activeToggle === 'sell' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} onClick={() => setActiveToggle('sell')}>sell</div>
            <div className={`font-acme w-24 py-2 ${activeToggle === 'redeem' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} onClick={() => setActiveToggle('redeem')}>redeem
              <span className="ml-1 rounded-full px-2 border-2 border-black hover:bg-black hover:text-white" 
                  onClick={(e) => {
                    e.stopPropagation()
                    setPopupToggle(true)
                  }}
                >?
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}