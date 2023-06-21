"use client"

import { useState } from "react"

export const TitleBar = () => {

const [buyToggle, setBuyToggle] = useState<boolean>(true)
const [sellToggle, setSellToggle] = useState<boolean>(false)
const [redeemToggle, setRedeemToggle] = useState<boolean>(false)
const [slippageToggle, setSlippageToggle] = useState<boolean>(false)
const [popupToggle, setPopupToggle] = useState<boolean>(false)

const test = () => {
  console.log('this test')
}

const handlePill = (action: number) => {
  if(action === 1) {
    setBuyToggle(true)
    setSellToggle(false)
    setRedeemToggle(false)
  }
  if(action === 2) {
    setBuyToggle(false)
    setSellToggle(true)
    setRedeemToggle(false)
  }
  if(action === 3) {
    setBuyToggle(false)
    setSellToggle(false)
    setRedeemToggle(true)
  }
}

  return (
    <>
      <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline" onClick={() => test()} >goldilocks AMM</h1>
      <div className="flex flex-row ml-2 items-center justify-between">
        <h3 className="font-acme text-[24px] ml-2">trading between $honey & $locks</h3>
        <div className="flex flex-row items-center">
          <h1 className="mr-4 text-[28px] hover:opacity-25 hover:cursor-pointer" onClick={() => setSlippageToggle(true)}>⚙️</h1>
          <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
            <div className={`font-acme w-24 py-2 ${buyToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(1)}>buy</div>
            <div className={`font-acme w-24 py-2 ${sellToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(2)}>sell</div>
            <div className={`font-acme w-24 py-2 ${redeemToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} onClick={() => handlePill(3)}>redeem
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