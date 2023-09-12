"use client"

import { useGoldilend } from "../../../providers"

export const TitleBar = () => {

  const {
    activeToggle,
    changeActiveToggle
  } = useGoldilend()

  return (
    <div className="flex flex-col w-[100%] h-[15%]">
      <h1 
        className="text-[36px] 2xl:text-[50px] font-acme text-[#ffff00]"
        id="text-outline" 
      >
        goldilend
      </h1>
      <div className="flex flex-row ml-2 items-center justify-between">
        <h3 className="font-acme text-[18px] 2xl:text-[24px] ml-2">berachain nft liquidity</h3>
        <div className="flex flex-row bg-white rounded-2xl border-2 border-black mr-6 lg:mr-0">
          <div 
            className={`font-acme text-[13px] 2xl:text-[16px] w-[66px] 2xl:w-24 py-2 ${activeToggle === 'loan' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} 
            onClick={() => changeActiveToggle('loan')}
          >
            loan
          </div>
          <div 
            className={`font-acme text-[13px] 2xl:text-[16px] w-[66px] 2xl:w-24 py-2 ${activeToggle === 'repay' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} 
            onClick={() => changeActiveToggle('repay')}
          >
            repay
          </div>
          <div 
            className={`font-acme text-[13px] 2xl:text-[16px] w-[66px] 2xl:w-24 py-2 ${activeToggle === 'boost' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} 
            onClick={() => changeActiveToggle('boost')}
          >
            boost
          </div>
          <div 
            className={`font-acme text-[13px] 2xl:text-[16px] w-[76px] 2xl:w-24 py-2 ${activeToggle === 'liquidate' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} 
            onClick={() => changeActiveToggle('liquidate')}
          >
            liquidate
          </div>
        </div>
      </div>
    </div>
  )
}