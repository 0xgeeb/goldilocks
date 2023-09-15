"use client"

import { useGoldilend } from "../../../providers"

export const LoanTab = () => {

  const {
    checkBondBalance,
    checkBandBalance
  } = useGoldilend()

  const renderBeras = () => {
    const bonds = checkBondBalance()
    bonds.then(yea => {
      for(let i = 0; i < yea; i++) {

      }
    })
    return <div>hello</div>
  }

  return (
    <div className="w-[100%] h-[100%] flex flex-row">
      <div className="h-[100%] w-[70%] bg-green-400">

      </div>
      <div className="h-[100%] w-[30%] flex flex-col bg-blue-400 px-2">
        <h1 className="font-acme mx-auto underline py-8 text-[18px] 2xl:text-[24px]">your beras</h1>
        <div className="flex flex-row">
          <img className="w-[50%]" src="https://ipfs.io/ipfs/QmSaVWb15oQ1HcsUjGGkjwHQ1mxJBYeivtBCgHHHiVLt7w" alt="bond" />
          <img className="w-[50%]" src="https://ipfs.io/ipfs/QmNWggx9vvBVEHZc6xwWkdyymoKuXCYrJ3zQwwKzocDxRt" alt="band" />
        </div>
      </div>
    </div>
  )
}