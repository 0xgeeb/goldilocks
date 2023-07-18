"use client"

import { useEffect } from "react"
import { BorrowButton } from "../../borrowing"
import { useWallet, useBorrowing } from "../../../providers"

export const BorrowBox = () => {

  // const {
  //   activeToggle
  // } = useWallet()
  return (
    <div className="flex flex-col h-[100%] w-[55%]">
      {/* <div className="bg-white border-2 border-black rounded-xl h-[60%] relative">
        <div className="flex flex-row justify-between items-center ml-10 mt-16">
          <h1 className="font-acme text-[40px]">{renderLabel()}</h1>
          <div className="flex flex-row items-center mr-3">
            <button 
              className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" 
              onClick={() => handlePercentageButtons(1)}
            >
              25%
            </button>
            <button 
              className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" 
              onClick={() => handlePercentageButtons(2)}
            >
              50%
            </button>
            <button 
              className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" 
              onClick={() => handlePercentageButtons(3)}
            >
              75%
            </button>
            <button 
              className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" 
              onClick={() => handlePercentageButtons(4)}
            >
              MAX
            </button>
          </div>
        </div>
        <div className="w-[100%] flex">
          <input 
            className="border-none focus:outline-none font-acme rounded-xl text-[40px] pl-12 w-[80%]" 
            placeholder="0.00"
            type="number"
            value={handleTopInput()} 
            onChange={(e) => handleTopChange(e.target.value)} 
            id="number-input" 
            autoFocus 
          />
        </div>
        <div className="absolute right-0 bottom-[35%]">
          <h1 
            className="text-[23px] mr-3 font-acme text-[#878d97]"
          >
            {activeToggle === 'borrow' ? 'borrow limit: ' : 'borrowed $honey: '} {handleBalance()}
          </h1>
        </div>
      </div>
      <div className="h-[15%] w-[80%] mx-auto mt-6">
        <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
      </div> */}
    </div>
  )
}