"use client"

import { useEffect, useState } from "react"
import { useGoldilend } from "../../../providers"

export const LoanTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

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

  return (
    <div className="w-[100%] h-[100%] flex flex-row">
      <div className="h-[100%] w-[70%] bg-green-400">

      </div>
      <div className="h-[100%] w-[30%] flex flex-col bg-blue-400 px-2">
        <h1 className="font-acme mx-auto underline py-8 text-[18px] 2xl:text-[24px]">your beras</h1>
        { 
          infoLoading ? loadingElement() : 
          <div className="flex flex-wrap overflow-y-auto h-[90%] border-2 border-black" id="hide-scrollbar">
            {
              beraArray.map((src, index) => (
                <div key={index} className="w-[50%] py-2">
                  <img className="ml-[5%] w-[90%] rounded-xl" src={src} alt="bera" id="home-button" />
                </div>
              ))
            }
          </div> 
        }
      </div>
    </div>
  )
}