"use client"

import { useEffect, useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useGoldilend, useNotification, useWallet } from "../../../providers"
import { useGoldilendTx } from "../../../hooks/goldilend"
import { contracts } from "../../../utils/addressi"

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

  const formatNum = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  const checkExpiry = (endDate: number): boolean => {
    if(endDate < Math.floor(Date.now() / 1000)) {
      return false
    }
    return true
  }

  const handleButtonClick = async (index: number) => {
    const id = `repay-button${index}`
    const button = document.getElementById(id)
    if(!checkExpiry(goldilendInfo.userLoans[index].endDate)) {
      button && (button.innerHTML = "loan expired")
      return
    }
    // const beraFlag = await checkRepayAllowance()
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
                </div>
                <div className="w-[100%] h-[85%] flex flex-row">
                  <div className="h-[100%] w-[30%] flex flex-row justify-between">
                    <div className="h-[100%] w-[50%] flex flex-col pl-1 justify-center">
                      <p>borrowed $BERA:</p>   
                      <p>interest:</p>
                      <p>expiration:</p>
                    </div>
                    <div className="h-[100%] w-[50%] flex flex-col justify-center items-end pr-4">
                      <p>{formatNum(loan.borrowedAmount)}</p>   
                      <p>{formatNum(loan.interest)}</p>   
                      <p>{formatDate(loan.endDate)}</p>
                    </div>
                  </div>
                  <div className="h-[100%] w-[40%] pl-4 pr-2">
                    <div className="w-[100%] h-[15%] pl-2">
                      <h1 className="text-[19px]">collateral</h1>
                    </div>
                    <div className="w-[100%] h-[85%] flex flex-row items-center overflow-x-auto" id="hide-scrollbar">
                      {
                        loan.collateralNFTs.map((nft) => (
                          <img
                            className="w-[20%] ml-[5%] rounded-xl"
                            id="home-button"
                            src={nft === contracts.bondbear.address ? 'https://ipfs.io/ipfs/QmSaVWb15oQ1HcsUjGGkjwHQ1mxJBYeivtBCgHHHiVLt7w' : 'https://ipfs.io/ipfs/QmNWggx9vvBVEHZc6xwWkdyymoKuXCYrJ3zQwwKzocDxRt'}
                            alt="collateral"
                          />
                        ))
                      }
                    </div>
                  </div>
                  <div className="h-[100%] w-[30%] bg-red-200" id="child-buttons">
                    {/* //todo: disable button if expired */}
                    <ConnectButton.Custom>
                      {({
                        account,
                        chain,
                        openConnectModal,
                        openChainModal
                      }) => {
                        return (
                          <button
                            className="h-[60%] w-[50%] mt-[2.5%] ml-[50%] rounded-xl px-4 2xl:px-6 border-2 border-black hover:scale-110 font-acme text-[20px] 2xl:text-[24px]"
                            id={`repay-button${index}`}
                            onClick={() => {
                              const id = `repay-button${index}`
                              const button = document.getElementById(id)

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
                                handleButtonClick(index)
                              }
                            }}
                          >
                            repay loan
                          </button>
                        )
                      }}
                    </ConnectButton.Custom>
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