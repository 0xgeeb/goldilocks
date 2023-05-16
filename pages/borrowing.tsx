import React, { useEffect, useState } from "react"
import Head from "next/head"
import { 
  useNotification,
  useWallet,
  useInfo,
  useTx
} from "../providers"
import { useSpring, animated } from "@react-spring/web"
import Bear from "../components/Bear"
import { contracts } from "../utils"

export default function Borrowing() {

  const [displayString, setDisplayString] = useState<string>('')
  
  const [borrow, setBorrow] = useState<number>(0)
  const [repay, setRepay] = useState<number>(0)

  const [borrowToggle, setBorrowToggle] = useState<boolean>(true)
  const [repayToggle, setRepayToggle] = useState<boolean>(false)

  const { openNotification } = useNotification()
  const { balance, wallet, isConnected, signer, network, getBalances, refreshBalances } = useWallet()
  const { borrowInfo, getBorrowInfo, refreshBorrowInfo } = useInfo()
  const { checkAllowance, sendApproveTx, sendBorrowTx, sendRepayTx } = useTx()

  const springs = useSpring({
    from: { x: -900 },
    to: { x: 0 },
  })

  const fetchBalances = async () => {
    await getBalances()
  }

  const fetchInfo = async () => {
    await getBorrowInfo()
  }

  const refreshInfo = async (signer: any) => {
    await refreshBorrowInfo(signer)
  }

  useEffect(() => {
    fetchBalances()
    fetchInfo()
  }, [isConnected])

  function test() {
    console.log(borrowInfo)
  }

  function handlePill(action: number) {
    setDisplayString('')
    setBorrow(0)
    setRepay(0)
    if(action === 1) {
      setBorrowToggle(true)
      setRepayToggle(false)
    }
    if(action === 2) {
      setBorrowToggle(false)
      setRepayToggle(true)
    }
  }

  function handleTopChange(input: string) {
    setDisplayString(input)
    if(borrowToggle) {
        if(!input) {
        setBorrow(0)
      }
      else {
        setBorrow(parseInt(input))
      }
    }
    if(repayToggle) {
      if(!input) {
        setRepay(0)
      }
      else {
        setRepay(parseInt(input))
      }
    }
  }

  function handleTopInput() {
    if(borrowToggle) {
      return parseFloat(displayString) >= (borrowInfo.fsl / borrowInfo.supply) * borrowInfo.staked  ? '' : displayString
    }
    if(repayToggle) {
      return parseFloat(displayString) >= borrowInfo.borrowed ? '' : displayString
    }
  }

  async function handleButtonClick() {
    const button = document.getElementById('amm-button')

    if(!isConnected) {
      button && (button.innerHTML = "connect wallet")
    }
    else if(network !== "Avalanche Fuji C-Chain") {
      button && (button.innerHTML = "switch to devnet plz")
    }
    else {
      if(borrowToggle) {
        if(borrow == 0) {
          return
        }
        button && (button.innerHTML = "borrowing...")
        const borrowTx = await sendBorrowTx(borrow, signer)
        borrowTx && openNotification({
          title: 'Successfully Borrowed $HONEY!',
          hash: borrowTx.hash,
          direction: 'borrowed',
          amount: borrow,
          price: 0,
          page: 'borrow'
        })
        button && (button.innerHTML = "borrow")
        setBorrow(0)
        setDisplayString('')
        refreshBalances(wallet, signer)
        refreshInfo(signer)
      }
      if(repayToggle) {
        if(repay == 0) {
          return
        }
        const sufficientAllowance: boolean | void = await checkAllowance('honey', contracts.borrow.address, repay, signer)
        if(sufficientAllowance) {
          button && (button.innerHTML = "repaying...")
          const repayTx = await sendRepayTx(repay, signer)
          repayTx && openNotification({
            title: 'Successfully Repaid $HONEY!',
            hash: repayTx.hash,
            direction: 'repaid',
            amount: repay,
            price: 0,
            page: 'borrow'
          })
          button && (button.innerHTML = "repay")
          setRepay(0)
          setDisplayString('')
          refreshBalances(wallet, signer)
          refreshInfo(signer)
        }
        else {
          button && (button.innerHTML = "approving...")
          await sendApproveTx('honey', contracts.borrow.address, repay, signer)
          setTimeout(() => {
            button && (button.innerHTML = "repay")
          }, 10000)
        }
      }
    }
  }

  function renderButton() {
    if(borrowToggle) {
      return 'borrow'
    }
    if(repayToggle) {
      if(repay > borrowInfo.honeyBorrowAllowance) {
        return 'approve use of $honey'
      }
      return 'repay'
    }
  }

  function renderLabel() {
    if(borrowToggle) {
      return 'borrow'
    }
    if(repayToggle) {
      return 'repay'
    }
  }

  function handleBalance() {
    if(borrowToggle) {
      return ((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply)) > 0 ? ((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply)).toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
    if(repayToggle) {
      return borrowInfo.borrowed > 0 ? borrowInfo.borrowed.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
  }

  function handlePercentageButtons(action: number) {
    if(action == 1) {
      if(borrowToggle) {
        setDisplayString((((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply)) / 4).toLocaleString('en-US', { maximumFractionDigits: 2 }))
        setBorrow(((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply)) / 4)
      }
      if(repayToggle) {
        setDisplayString((borrowInfo.borrowed / 4).toLocaleString('en-US', { maximumFractionDigits: 2 }))
        setRepay(borrowInfo.borrowed / 4)
      }
    }
    if(action == 2) {
      if(borrowToggle) {
        setDisplayString((((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply)) / 2).toLocaleString('en-US', { maximumFractionDigits: 2 }))
        setBorrow(((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply)) / 2)
      }
      if(repayToggle) {
        setDisplayString((borrowInfo.borrowed / 2).toLocaleString('en-US', { maximumFractionDigits: 2 }))
        setRepay(borrowInfo.borrowed / 2)
      }
    }
    if(action == 3) {
      if(borrowToggle) {
        setDisplayString((((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply)) * 0.75).toLocaleString('en-US', { maximumFractionDigits: 2 }))
        setBorrow(((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply)) * 0.75)
      }
      if(repayToggle) {
        setDisplayString((borrowInfo.borrowed * 0.75).toLocaleString('en-US', { maximumFractionDigits: 2 }))
        setRepay(borrowInfo.borrowed * 0.75)
      }
    }
    if(action == 4) {
      if(borrowToggle) {
        setDisplayString(((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply)).toLocaleString('en-US', { maximumFractionDigits: 2 }))
        setBorrow((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply))
      }
      if(repayToggle) {
        setDisplayString(borrowInfo.borrowed.toLocaleString('en-US', { maximumFractionDigits: 2 }))
        setRepay(borrowInfo.borrowed)
      }
    }
  }

  return (
    <>
      <Head>
        <title>mf borrowing</title>
      </Head>
      <div className="flex flex-row py-3">
        <animated.div className="w-[57%] flex flex-col pt-8 pb-2 px-3 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black" style={springs}>
          <h1 className="text-[50px] font-acme text-[#ffff00] ml-5" id="text-outline" onClick={() => test()}>borrowing</h1>
          <div className="flex flex-row ml-5 items-center justify-between">
            <h3 className="font-acme text-[24px] ml-5">lock staked $locks and borrow $honey</h3>
            <div className="flex flex-row bg-white rounded-2xl border-2 border-black mr-3">
              <div className={`font-acme w-20 py-2 ${borrowToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(1)}>borrow</div>
              <div className={`font-acme w-20 py-2 ${repayToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center rounded-r-2xl cursor-pointer`} onClick={() => handlePill(2)}>repay</div>
            </div>
          </div>
          <div className="flex flex-row mt-4 h-[100%] justify-between">
            <div className="flex flex-col h-[100%] w-[55%]">
              <div className="bg-white border-2 border-black rounded-xl h-[60%] relative">
                <div className="flex flex-row justify-between items-center ml-10 mt-16">
                  <h1 className="font-acme text-[40px]">{renderLabel()}</h1>
                  <div className="flex flex-row items-center mr-3">
                    <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(1)}>25%</button>
                    <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(2)}>50%</button>
                    <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(3)}>75%</button>
                    <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(4)}>MAX</button>
                  </div>
                </div>
                <div className="w-[100%] flex">
                  <input className="border-none focus:outline-none font-acme rounded-xl text-[40px] pl-12 w-[80%]" placeholder="0.00" type="number" value={handleTopInput()} onChange={(e) => handleTopChange(e.target.value)} id="number-input" autoFocus />
                </div>
                <div className="absolute right-0 bottom-[35%]">
                  <h1 className="text-[23px] mr-3 font-acme text-[#878d97]">balance: {handleBalance()}</h1>
                </div>
              </div>
              <div className="h-[15%] w-[80%] mx-auto mt-6">
                <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
              </div>
            </div>
            <div className="w-[40%] h-[85%] bg-white border-2 border-black rounded-xl flex flex-col px-6 py-5">
              <div className="flex flex-row justify-between items-center">
                <h1 className="font-acme text-[24px]">borrow limit:</h1>
                <p className="font-acme text-[20px]">${borrowInfo.staked ? ((borrowInfo.staked - borrowInfo.locked) * (borrowInfo.fsl / borrowInfo.supply)).toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
              </div>
              <div className="flex flex-row justify-between items-center mt-6">
                <h1 className="font-acme text-[24px]">$LOCKS floor price:</h1>
                <p className="font-acme text-[20px]">{(borrowInfo.fsl / borrowInfo.supply) > 0 ? `$${(borrowInfo.fsl / borrowInfo.supply).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : "-"}</p>
              </div>
              <div className="flex flex-row justify-between items-center mt-6">
                <h1 className="font-acme text-[24px]">$LOCKS balance:</h1>
                <p className="font-acme text-[20px]">{balance.locks > 0 ? balance.locks.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
              </div>
              <div className="flex flex-row justify-between items-center mt-6">
                <h1 className="font-acme text-[24px]">staked $LOCKS:</h1>
                <p className="font-acme text-[20px]">{borrowInfo.staked ? borrowInfo.staked.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
              </div>
              <div className="flex flex-row justify-between items-center mt-6">
                <h1 className="font-acme text-[24px]">locked $LOCKS:</h1>
                <p className="font-acme text-[20px]">{borrowInfo.locked > 0 ? borrowInfo.locked.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
              </div>
              <div className="flex flex-row justify-between items-center mt-6">
                <h1 className="font-acme text-[24px]">$HONEY balance:</h1>
                <p className="font-acme text-[20px]">{balance.honey > 0 ? balance.honey.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
              </div>
              <div className="flex flex-row justify-between items-center mt-6">
                <h1 className="font-acme text-[24px]">borrowed $HONEY:</h1>
                <p className="font-acme text-[20px]">{borrowInfo.borrowed > 0 ? borrowInfo.borrowed.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
              </div>
            </div>
          </div>
        </animated.div>
        <Bear />
      </div>
    </>
  )
}