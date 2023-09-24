"use client"

import { useEffect, useState } from "react"
import { useGoldilend } from "../../../providers"

export const BoostTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  const { 
    ownedPartners,
    selectedPartners,
    getOwnedPartners,
    findSelectedPartnerIdxs,
    handlePartnerClick
   } = useGoldilend()

  useEffect(() => {
    getOwnedPartners()
    setInfoLoading(false)
  }, [])

  const loadingElement = () => {
    return <span className="loader-small mx-auto"></span>
  }
  return (
    <div className="w-[100%] h-[95%] flex flex-row justify-between">
      <div className="h-[97.5%] mt-[2.5%] w-[67.5%] flex flex-col border-2 border-black rounded-xl bg-white">

      </div>
      <div className="h-[97.5%] mt-[2.5%] w-[30%] flex flex-col px-2 border-2 border-black rounded-xl bg-white">
        <h1 onClick={() => console.log(selectedPartners)} className="font-acme mx-auto underline py-4 text-[18px] 2xl:text-[24px]">your partner nfts</h1>
        {
          infoLoading ? loadingElement() :
          <div className="flex flex-wrap overflow-y-auto h-[90%]" id="hide-scrollbar">
            {
              ownedPartners.map((partner, index) => (
                <div key={index} className="h-[30%] w-[50%] py-2">
                  {
                    partner.name === 'Beradrome' ?
                      <img
                        className={`ml-[5%] w-[90%] rounded-xl hover:scale-110 hover:cursor-pointer ${findSelectedPartnerIdxs().includes(partner.index) ? "border-4 border-black" : "opacity-75"}`}
                        onClick={() => handlePartnerClick(partner)}
                        src={partner.imageSrc}
                        alt="partner"
                        id="home-button"
                      /> 
                    :
                      <video 
                        className={`ml-[5%] w-[90%] rounded-xl hover:scale-110 hover:cursor-pointer ${findSelectedPartnerIdxs().includes(partner.index) ? "border-4 border-black" : "opacity-75"}`}
                        onClick={() => handlePartnerClick(partner)}
                        id="home-button"
                        autoPlay
                        loop 
                        muted
                      >
                        <source src={partner.imageSrc} type="video/mp4" />
                      </video>
                  }
                  </div>
              ))
            }
          </div>
        }
      </div>
    </div>
  )
}