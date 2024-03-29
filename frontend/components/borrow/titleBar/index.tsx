"use client"

import { useBorrowing } from "../../../providers"

export const TitleBar = () => {

  const { 
    activeToggle, 
    changeActiveToggle,
    setBorrowPopupToggle
  } = useBorrowing()

  return (
    <>
      <h1 
        className="text-[36px] 2xl:text-[50px] font-acme text-[#ffff00]" 
        id="text-outline" 
      >
        borrowing
      </h1>
      <div className="flex flex-row items-center justify-between">
        <h3 className="font-acme text-[18px] 2xl:text-[24px] ml-5">lock staked $locks and borrow $honey</h3>
        <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
          <div 
            className={`font-acme text-[13px] 2xl:text-[16px] w-[86px] 2xl:w-24 py-2 ${activeToggle === 'borrow' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} 
            onClick={() => changeActiveToggle('borrow')}
          >
            borrow
            <span 
              className="ml-1 text-[13px] 2xl:text-[16px] rounded-full px-2 border-2 border-black hover:bg-black hover:text-white" 
              onClick={(e) => {
                e.stopPropagation()
                setBorrowPopupToggle(true)
              }}
            >
              ?
            </span>
          </div>
          <div 
            className={`font-acme text-[13px] 2xl:text-[16px] w-[66px] 2xl:w-20 py-2 ${activeToggle === 'repay' ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center rounded-r-2xl cursor-pointer`} 
            onClick={() => changeActiveToggle('repay')}
          >
            repay
          </div>
        </div>
      </div>
    </>
  )
}