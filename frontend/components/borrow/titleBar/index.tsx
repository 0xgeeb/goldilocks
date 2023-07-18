"use client"

import { useBorrowing } from "../../../providers"

export const TitleBar = () => {

  const { activeToggle, changeActiveToggle } = useBorrowing()

  const test = () => {

  }

  return (
    <>
      <h1 
        className="text-[50px] font-acme text-[#ffff00] ml-5" 
        id="text-outline" 
        onClick={() => test()}
      >
        borrowing
      </h1>
      <div className="flex flex-row ml-5 items-center justify-between">
        <h3 className="font-acme text-[24px] ml-5">lock staked $locks and borrow $honey</h3>
        <div className="flex flex-row bg-white rounded-2xl border-2 border-black mr-3">
          <div 
            className={`font-acme w-20 py-2 ${activeToggle === 'borrow' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} 
            onClick={() => changeActiveToggle('borrow')}
          >
            borrow
          </div>
          {/* //todo: image is getting in the way of this button */}
          <div 
            className={`font-acme w-20 py-2 ${activeToggle === 'repay' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center rounded-r-2xl cursor-pointer`} 
            onClick={() => changeActiveToggle('repay')}
          >
            repay
          </div>
        </div>
      </div>
    </>
  )
}