"use client"

import { useEffect, useState } from "react"
import { useGoldilend } from "../../../providers"

export const LoanTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)
  const [selectedBeras, setSelectedBeras] = useState<string[]>([])

  const {
    checkBeraBalance,
    beraArray
  } = useGoldilend()

  useEffect(() => {
    if(infoLoading) {
      checkBeraBalance()
      setInfoLoading(false)
    }
  }, [])

  const loadingElement = () => {
    return <span className="loader-small mx-auto"></span>
  }

  const handleBeraClick = (src: string) => {
    if(selectedBeras.includes(src)) {
      setSelectedBeras(prev => prev.filter(bera => bera !== src))
    }
    else {
      setSelectedBeras(prev => [...prev, src])
    }
  }

  return (
    <div className="w-[100%] h-[100%] flex flex-row justify-between">
      <div className="h-[97.5%] mt-[2.5%] w-[67.5%] flex flex-col px-6 bg-white border-2 border-black rounded-xl">
        <h1 className="font-acme py-4 text-[20px] 2xl:text-[26px]">create loan</h1>
        <h2 className="font-acme text-[18px] 2xl:text-[24px]">loan amount</h2>
      </div>
      <div className="h-[97.5%] mt-[2.5%] w-[30%] flex flex-col border-2 border-black rounded-xl bg-white px-2">
        <h1 className="font-acme mx-auto underline py-4 text-[18px] 2xl:text-[24px]">your beras</h1>
        { 
          infoLoading ? loadingElement() : 
          <div className="flex flex-wrap overflow-y-auto h-[90%]" id="hide-scrollbar">
            {
              beraArray.map((src, index) => (
                <div key={index} className="w-[50%] py-2">
                  <img 
                    className={`ml-[5%] w-[90%] rounded-xl hover:scale-110 hover:cursor-pointer ${selectedBeras.includes(index.toString()) ? "border-4 border-black" : "opacity-75"}`}
                    onClick={() => handleBeraClick(index.toString())}
                    src={src}
                    alt="bera"
                    id="home-button"
                  />
                </div>
              ))
            }
          </div> 
        }
      </div>
    </div>
  )
}