"use client"

import { useState } from "react"
import { RealizePopup } from "../realizePopup"
import { useStaking } from "../../../providers"

export const TitleBar = () => {

  const [popupToggle, setPopupToggle] = useState<boolean>(false)
  const { activeToggle, changeActiveToggle } = useStaking()

  const test = () => {

  }

  return (
    <>
      <RealizePopup popupToggle={popupToggle} setPopupToggle={setPopupToggle}/>
      <h1 
        className="text-[36px] 2xl:text-[50px] font-acme text-[#ffff00]" 
        id="text-outline" 
        onClick={() => test()}
      >
        staking
      </h1>
      <div className="flex flex-row ml-2 items-center justify-between">
        <h3 className="font-acme text-[18px] 2xl:text-[24px] ml-2">staking $locks for $porridge</h3>
        <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
          <div 
            className={`font-acme text-[13px] 2xl:text-[16px] w-[66px] 2xl:w-20 py-1 2xl:py-2 ${activeToggle === 'stake' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} 
            onClick={() => changeActiveToggle('stake')}
          >
            stake
          </div>
          <div 
            className={`font-acme text-[13px] 2xl:text-[16px] w-[66px] 2xl:w-20 py-1 2xl:py-2 ${activeToggle === 'unstake' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} 
            onClick={() => changeActiveToggle('unstake')}
          >
            unstake
          </div>
          <div 
            className={`font-acme text-[13px] 2xl:text-[16px] w-[66px] 2xl:w-20 py-1 2xl:py-2 ${activeToggle === 'realize' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} 
            onClick={() => changeActiveToggle('realize')}
          >
            stir 
            <span 
              className="ml-1 text-[13px] 2xl:text-[16px] rounded-full px-2 border-2 border-black hover:bg-black hover:text-white" 
              onClick={(e) => {
                e.stopPropagation()
                setPopupToggle(true)
              }}
            >
              ?
            </span>
          </div>
        </div>
      </div>
    </>
  )
}