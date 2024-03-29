"use client"

import { useState, useEffect } from "react"
import { useGamm } from "../../../providers"

export const TitleBar = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  const { 
    slippage, 
    changeSlippageToggle, 
    activeToggle, 
    changeActiveToggle,
    setRedeemPopupToggle,
    refreshChartInfo,
    checkSlippageAmount
  } = useGamm()

  const loadingElement = () => {
    return <span className="loader-small ml-3"></span>
  }

  const test = () => {
    // navigator.geolocation.getCurrentPosition(position => {
    //   console.log(position)
    // })
    // refreshChartInfo()
  }

  useEffect(() => {
    checkSlippageAmount()
    setInfoLoading(false)
  }, [])

  return (
    <div className="flex flex-col w-[100%] h-[15%]">
      <h1 
        className="text-[36px] 2xl:text-[50px] font-acme text-[#ffff00]"
        id="text-outline" 
        onClick={() => test()} 
      >
        goldilocks AMM
      </h1>
      <div className="flex flex-row ml-2 items-center justify-between">
        <h3 className="font-acme text-[18px] 2xl:text-[24px] ml-2">trading between $honey & $locks</h3>
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center mr-[5%]">
            <p className="font-acme text-[13px] 2xl:text-[16px]">
              { infoLoading ? loadingElement() : `${slippage.amount}%` }
            </p>
            <h1 
              className="text-[28px] 2xl:text-[36px] hover:opacity-25 hover:cursor-pointer ml-2" 
              onClick={() => changeSlippageToggle(true)}
            >
              ⚙️
            </h1>
          </div>
          <div className="flex flex-row bg-white rounded-2xl border-2 border-black mr-6 lg:mr-0">
            <div 
              className={`font-acme text-[13px] 2xl:text-[16px] w-[66px] 2xl:w-24 py-2 ${activeToggle === 'buy' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} 
              onClick={() => changeActiveToggle('buy')}
            >
              buy
            </div>
            <div 
              className={`font-acme text-[13px] 2xl:text-[16px] w-[66px] 2xl:w-24 py-2 ${activeToggle === 'sell' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} 
              onClick={() => changeActiveToggle('sell')}
            >
              sell
            </div>
            <div 
              className={`font-acme text-[13px] 2xl:text-[16px] w-[76px] 2xl:w-24 py-2 ${activeToggle === 'redeem' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} 
              onClick={() => changeActiveToggle('redeem')}
            >
              redeem
              <span 
                className="ml-1 text-[13px] 2xl:text-[16px] rounded-full px-2 border-2 border-black hover:bg-black hover:text-white" 
                onClick={(e) => {
                  e.stopPropagation()
                  setRedeemPopupToggle(true)
                }}
              >
                ?
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}