"use client"

import { useEffect, useState } from "react"
import { useGoldilend, useNotification, useWallet } from "../../../providers"
import { useGoldilendTx } from "../../../hooks/goldilend"

export const RepayTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  const {
    goldilendInfo,
    findLoans
  } = useGoldilend()

  const { openNotification } = useNotification()
  const { isConnected } = useWallet()

  useEffect(() => {
    findLoans()
    setInfoLoading(false)
  }, [isConnected])

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = String(date.getFullYear())
    return `${month}-${day}-${year}`
  }

  return (
    <div className="h-[95%] mt-[2.5%] w-[100%] flex flex-col py-4 px-6 border-2 border-black rounded-xl bg-white font-acme">
      <h1 className="pb-4 text-[24px] 2xl:text-[30px]">repay loan</h1>
      <div className="w-[100%] h-[85%] mt-2">
        <h2 onClick={() => console.log(goldilendInfo.userLoans)} className="ml-2 text-[18px] 2xl:text-[24px]">your loans</h2>
        <div className="w-[100%] h-[90%] mt-[1%] flex flex-wrap overflow-y-auto" id="hide-scrollbar">
          {
            goldilendInfo.userLoans.map((loan, index) => (
              <div className="w-[100%] h-[40%] mb-[1%] flex flex-col px-6 py-2 rounded-xl border-2 border-black bg-slate-100" key={index}>
                <div className="w-[100%] h-[15%] flex flex-row justify-between">
                  <h1>loan # {loan.loanId}</h1>
                  <h1>{loan.liquidated ? 'liquidated' : ''}</h1>
                </div>
                <div className="w-[100%] h-[85%] flex flex-row">
                  <div className="h-[100%] w-[33%] flex flex-row justify-between bg-red-200">
                    <div className="h-[100%] w-[50%] flex flex-col">
                      <p>borrowed amount:</p>   
                      <p>interest:</p>
                      <p>expiration:</p>
                    </div>
                    <div className="h-[100%] w-[50%] flex flex-col">
                      <p>{loan.borrowedAmount}</p>   
                      <p>{loan.interest}</p>   
                      <p>{formatDate(loan.endDate)}</p>
                    </div>
                  </div>
                  <div className="h-[100%] w-[33%] bg-red-300">

                  </div>
                  <div className="h-[100%] w-[33%] bg-red-400">
                    {/* //todo: disable button if expired */}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}