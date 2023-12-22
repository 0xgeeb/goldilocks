"use client"

import { useEffect, useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useGoldilend, useNotification } from "../../../providers"
import { useGoldilendTx } from "../../../hooks"
import { contracts } from "../../../utils/addressi"

export const LiquidateTab = () => {

  const {
    goldilendInfo,
    findLoan
  } = useGoldilend()

  const {
    checkRepayAllowance,
    sendBeraApproveTx,
    sendLiquidateTx
  } = useGoldilendTx()

  const { openNotification } = useNotification()

  const [infoLoading, setInfoLoading] = useState<boolean>(false)
  const [searchToggle, setSearchToggle] = useState<boolean>(true)
  const [searchAddy, setSearchAddy] = useState<string>('')
  const [searchId, setSearchId] = useState<string>('')

  const loadingElement = () => {
    return <span className="loader-small mx-auto"></span>
  }

  const formatNum = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  const checkDate = (timestamp: number): boolean => {
    if(timestamp > Math.floor(Date.now() / 1000)) {
      return false
    }
    return false
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = String(date.getFullYear())
    return `${month}-${day}-${year}`
  }

  const searchLoan = () => {
    setSearchToggle(false)
    setInfoLoading(true)
    findLoan(searchAddy, parseFloat(searchId))
    setInfoLoading(false)
  }

  const backArrowClick = () => {
    setSearchToggle(true)
  }

  const handleButtonClick = async () => {
    const button = document.getElementById('amm-button')
    const amt = goldilendInfo.loanToLiq.borrowedAmount
    if(!checkDate(goldilendInfo.loanToLiq.endDate)) {
      button && (button.innerHTML = "loan not expired")
      return
    }
    if(goldilendInfo.bera < amt) {
      button && (button.innerHTML = "insufficient $BERA")
      return
    }
    if(goldilendInfo.loanToLiq.liquidated) {
      button && (button.innerHTML = "liquidated")
      return
    }
    const beraAllowance = await checkRepayAllowance(amt)
    if(beraAllowance) {
      button && (button.innerHTML = "liquidating...")
      const liqTx = await sendLiquidateTx(searchAddy, parseInt(searchId))
      liqTx && openNotification({
        title: 'Successfully Liquidated!',
        hash: liqTx,
        direction: 'liquidated',
        amount: amt,
        price: goldilendInfo.loanToLiq.loanId,
        page: 'goldilend-liq'
      })
      button && (button.innerHTML = "liquidate loan")
      setSearchAddy('')
      setSearchId('')
      setSearchToggle(true)
    }
    else {
      button && (button.innerHTML = "approving")
      await sendBeraApproveTx(amt)
      setTimeout(() => {
        button && (button.innerHTML = "liquidate loan")
      }, 10000)
    }
  }

  const gypsy =['0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083', '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083']

  return (
    <div className="h-[95%] mt-[2.5%] w-[100%] flex flex-col py-4 px-6 border-2 border-black rounded-xl bg-white font-acme">
      <h1 className="pb-4 text-[24px] 2xl:text-[30px]">liquidate a loan</h1>
      {
        searchToggle ?
          <div className="h-[50%] w-[100%] flex flex-col items-center">
            <div className="w-[100%] h-[20%] mx-auto flex justify-center">
              <h1 className="text-[20px] 2xl:text-[26px]">loan search</h1>
            </div>
            <div className="flex flex-col w-[100%] h-[40%] mt-[2%] justify-between items-center">
              <input 
                className="w-[40%] h-[40%] focus:outline-none pl-4 rounded-xl border-2 border-black"
                type="text"
                id="home-button"
                placeholder="0x0000000000000000000000000000000000000000"
                value={searchAddy}
                onChange={(e) => setSearchAddy(e.target.value)}
              />
              <input 
                className="w-[40%] h-[40%] focus:outline-none pl-4 rounded-xl border-2 border-black"
                type="text"
                id="home-button"
                placeholder="loan id"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <button
              className="h-[20%] w-[25%] mt-[2%] rounded-xl px-4 2xl:px-6 border-2 border-black hover:scale-110"
              id="search-button"
              onClick={() => searchLoan()}
            >
              search
            </button>
          </div> :
        infoLoading ?
          loadingElement() :
          <div className="w-[100%] h-[100%] relative">
            <div className="w-[30%] h-[100%] flex flex-col justify-around pl-[5%]">
              <div className="flex flex-col">
                <h1 className="text-[26px]">loan #{goldilendInfo.loanToLiq.loanId}</h1>
                <h1 className="pl-[3%]">(owner: {searchAddy.slice(0, 6)}...)</h1>
              </div>
              {goldilendInfo.loanToLiq.liquidated && <h1 className="text-red-500 text-[24px]">liquidated</h1>}
              <div className="flex flex-col">
                <h1>expiration date</h1>
                <h1 className="pl-[3%]">{formatDate(goldilendInfo.loanToLiq.endDate)}</h1>
              </div>
              <div className="flex flex-col">
                <h1>borrowed amount</h1>
                <h1 className="pl-[3%]">{formatNum(goldilendInfo.loanToLiq.borrowedAmount)}</h1>
              </div>
              <div className="flex flex-col">
                <h1>interest</h1>
                <h1 className="pl-[3%]">{formatNum(goldilendInfo.loanToLiq.interest)}</h1>
              </div>
            </div>
            <div className="absolute h-[65%] w-[35%] top-[30%] left-[32.5%] flex flex-col">
              <h1 className="py-2 pl-2">collateral</h1>
              <div className="flex flex-wrap overflow-y-auto" id="hide-scrollbar">
                {
                  gypsy.map((nft) => (
                    <img 
                      className="w-[20%] mt-[3%] ml-[2.5%] mr-[2.5%] rounded-xl"
                      id="home-button"
                      src={nft === contracts.bondbear.address ? 'https://ipfs.io/ipfs/QmSaVWb15oQ1HcsUjGGkjwHQ1mxJBYeivtBCgHHHiVLt7w' : 'https://ipfs.io/ipfs/QmNWggx9vvBVEHZc6xwWkdyymoKuXCYrJ3zQwwKzocDxRt'}
                      alt="collateral"
                      key={nft}
                    />
                  ))
                }
              </div>
            </div>
            <img
              className="absolute h-[10%] w-[5%] top-[3%] right-[6%] border-2 border-black rounded-full cursor-pointer hover:scale-125"
              src="/back_arrow.png"
              alt="backarrow"
              onClick={() => backArrowClick()}
            />
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openConnectModal,
                openChainModal
              }) => {
                return (
                  <button
                    className="absolute h-[15%] w-[20%] bottom-[9%] right-[6%] rounded-2xl px-4 2xl:px-6 border-2 border-black hover:scale-110"
                    id="amm-button"
                    onClick={() => {
                      const button = document.getElementById('amm-button')

                      if(!account) {
                        if(button && button.innerHTML === "connect wallet") {
                          openConnectModal()
                        }
                        else {
                          button && (button.innerHTML = "connect wallet")
                        }
                      }
                      else if(chain?.name !== "Goerli test network") {
                        if(button && button.innerHTML === "switch to goerli plz") {
                          openChainModal()
                        }
                        else {
                          button && (button.innerHTML = "switch to goerli plz")
                        }
                      }
                      else {
                        handleButtonClick()
                      }
                    }}
                  >
                    liquidate loan
                  </button>
                )
              }}
            </ConnectButton.Custom>
          </div>
      }
    </div>
  )
}