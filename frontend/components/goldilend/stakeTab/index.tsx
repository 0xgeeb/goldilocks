"use client"

import { useEffect, useState } from "react"

export const StakeTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  useEffect(() => {
    setInfoLoading(false)
  }, [])

  const loadingElement = () => {
    return <span className="loader-small mx-auto"></span>
  }

  return (
    <div className="w-[100%] h-[95%] flex flex-row justify-between">
      <div className="h-[97.5%] mt-[2.5%] w-[67.5%] flex flex-col border-2 border-black">

      </div>
      <div className="h-[97.5%] mt-[2.5%] w-[30%] flex flex-col border-2 border-black">
        <h1 className="font-acme mx-auto text-[18px] 2xl:text-[24px]">your loans</h1>
        {
          infoLoading ? loadingElement() :
          <div>
            {

            }
          </div>
        }
      </div>
    </div>
  )
}