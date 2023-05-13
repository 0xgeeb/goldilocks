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

export default function Staking() {

  const [initialRender, setInitialRender] = useState<boolean>(false)

  const [displayString, setDisplayString] = useState<string>('')
  
  const [stake, setStake] = useState<number>(0)
  const [unstake, setUnstake] = useState<number>(0)
  const [realize, setRealize] = useState<number>(0)
  
  const [stakeToggle, setStakeToggle] = useState<boolean>(true)
  const [unstakeToggle, setUnstakeToggle] = useState<boolean>(false)
  const [realizeToggle, setRealizeToggle] = useState<boolean>(false)

  const [popupToggle, setPopupToggle] = useState<boolean>(false)

  const { openNotification } = useNotification()
  const { balance, wallet, isConnected, signer, network, getBalances, refreshBalances } = useWallet()
  const { stakeInfo, getStakeInfo, refreshStakeInfo } = useInfo()
  const { checkAllowance, sendApproveTx, sendStakeTx, sendUnstakeTx, sendRealizeTx, sendClaimTx } = useTx()
  
  const springs = useSpring({
    from: { x: -900 },
    to: { x: 0 },
  })

  const fetchBalances = async () => {
    await getBalances()
  }
  
  const fetchInfo = async () => {
    await getStakeInfo()
  }

  const refreshInfo = async (signer: any) => {
    console.log('running refreshtakeinfo')
    await refreshStakeInfo(signer)
  }

  useEffect(() => {
    fetchBalances()
    fetchInfo()
  }, [isConnected])

  useEffect(() => {
    setInitialRender(true)
  }, [])

  // const { config: realizeConfig } = usePrepareContractWrite({
  //   address: contracts.porridge.address as `0x${string}`,
  //   abi: contracts.porridge.abi,
  //   functionName: 'realize',
  //   args: [BigNumber.from(ethers.utils.parseUnits(debouncedRealize.toString(), 18))],
  //   enabled: Boolean(debouncedRealize),
  //   onSettled() {
  //     console.log('just settled realize')
  //     console.log('debouncedRealize: ', debouncedRealize)
  //   }
  // })
  // const { data: realizeData, write: realizeInteraction } = useContractWrite(realizeConfig)
  // const { isLoading: realizeIsLoading, isSuccess: realizeIsSuccess } = useWaitForTransaction({
  //   hash: realizeData?.hash
  // })

  // const { config: claimConfig } = usePrepareContractWrite({
  //   address: contracts.porridge.address as `0x${string}`,
  //   abi: contracts.porridge.abi,
  //   functionName: 'claim',
  //   enabled: true,
  //   onSettled() {
  //     console.log('just settled claim')
  //   }
  // })
  // const { data: claimData, write: claimInteraction } = useContractWrite(claimConfig)
  // const { isLoading: claimIsLoading, isSuccess: claimIsSuccess } = useWaitForTransaction({
  //   hash: claimData?.hash
  // })

  function test() {
    console.log(balance)
    console.log(stakeInfo)
  }

  function handlePill(action: number) {
    setDisplayString('')
    setStake(0)
    setUnstake(0)
    setRealize(0)
    if(action === 1) {
      setStakeToggle(true)
      setUnstakeToggle(false)
      setRealizeToggle(false)
    }
    if(action === 2) {
      setStakeToggle(false)
      setUnstakeToggle(true)
      setRealizeToggle(false)
    }
    if(action === 3) {
      setStakeToggle(false)
      setUnstakeToggle(false)
      setRealizeToggle(true)
    }
  }

  function handleTopChange(input: string) {
    setDisplayString(input)
    if(stakeToggle) {
      if(!input) {
        setStake(0)
      }
      else {
        setStake(parseFloat(input))
      }
    }
    if(unstakeToggle) {
      if(!input) {
        setUnstake(0)
      }
      else {
        setUnstake(parseFloat(input))
      }
    }
    if(realizeToggle) {
      if(!input) {
        setRealize(0)
      }
      else {
        setRealize(parseFloat(input))
      }
    }
  }

  function handleTopInput() {
    if(stakeToggle) {
      return parseFloat(displayString) >= balance.locks ? '' : displayString
    }
    if(unstakeToggle) {
      return parseFloat(displayString) >= stakeInfo.staked ? '' : displayString
    }
    if(realizeToggle) {
      return parseFloat(displayString) >= balance.prg ? '' : displayString
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
      if(stakeToggle) {
        if(stake == 0) {
          return
        }
        const sufficientAllowance: boolean | void = await checkAllowance('locks', contracts.porridge.address, stake, signer)
        if(sufficientAllowance) {
          button && (button.innerHTML = "staking...")
          const stakeTx = await sendStakeTx(stake, signer)
          stakeTx && openNotification({
            title: 'Successfully Staked $LOCKS!',
            hash: stakeTx.hash,
            direction: 'staked',
            amount: stake,
            price: 0,
            page: 'stake'
          })
          button && (button.innerHTML = "stake")
          setStake(0)
          setDisplayString('')
          refreshBalances(wallet, signer)
          refreshInfo(signer)
        }
        else {
          button && (button.innerHTML = "approving...")
          await sendApproveTx('locks', contracts.porridge.address, stake , signer)
          setTimeout(() => {
            button && (button.innerHTML = "stake")
          }, 10000)
        }
      }
      if(unstakeToggle) {
        if(unstake == 0) {
          return
        }
        button && (button.innerHTML = "unstaking...")
        const unstakeTx = await sendUnstakeTx(unstake, signer)
        unstakeTx && openNotification({
          title: 'Successfully Unstaked $LOCKS!',
          hash: unstakeTx.hash,
          direction: 'unstaked',
          amount: unstake,
          price: 0,
          page: 'stake'
        })
        button && (button.innerHTML = "unstake")
        setUnstake(0)
        setDisplayString('')
        refreshBalances(wallet, signer)
        refreshInfo(signer)
      }
      if(realizeToggle) {
        if(realize == 0) {
          return
        }
        const sufficientAllowance: boolean | void = await checkAllowance('honey', contracts.porridge.address, realize, signer)
        if(sufficientAllowance) {
          button && (button.innerHTML = "stirring...")
          const realizeTx = await sendRealizeTx(realize, signer)
          realizeTx && openNotification({
            title: 'Successfully Stirred $LOCKS!',
            hash: realizeTx.hash,
            direction: 'stirred',
            amount: realize,
            price: 0,
            page: 'stake'
          })
          button && (button.innerHTML = "realize")
          setRealize(0)
          setDisplayString('')
          refreshBalances(wallet, signer)
          refreshInfo(signer)
        }
        else {
          button && (button.innerHTML = "approving...")
          await sendApproveTx('honey', contracts.porridge.address, realize, signer)
          setTimeout(() => {
            button && (button.innerHTML = "realize")
          }, 10000)
        }
      }
    }
  }

  async function handleClaimFunction() {
    console.log('hello')
    const button = document.getElementById('claim-button')

    if(network !== "Avalanche Fuji C-Chain") {
      button && (button.innerHTML = "switch to devnet plz")
    }
    else {
      button && (button.innerHTML = "claiming...")
      const claimTx = await sendClaimTx(signer)
      claimTx && openNotification({
        title: 'Successfully Claimed $PRG!',
        hash: claimTx.hash,
        direction: 'claimed',
        amount: stakeInfo.yieldToClaim,
        price: 0,
        page: 'claim'
      })
      button && (button.innerHTML = "claim yield")
      refreshBalances(wallet, signer)
      refreshInfo(signer)
    }
  }
  

  function renderButton() {
    if(stakeToggle) {
      if(stake > stakeInfo.locksPrgAllowance) {
        return 'approve use of $locks'
      }
      return 'stake'
    }
    if(unstakeToggle) {
      return 'unstake'
    }
    if(realizeToggle) {
      if(realize > stakeInfo.honeyPrgAllowance) {
        return 'approve use of $honey'
      }
      return 'stir'
    }
  }

  function renderLabel() {
    if(stakeToggle) {
      return 'stake'
    }
    if(unstakeToggle) {
      return 'unstake'
    }
    if(realizeToggle) {
      return 'stir'
    }
  }

  function handleBalance() {
    if(stakeToggle) {
      return balance.locks > 0 ? balance.locks.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.0"
    }
    if(unstakeToggle) {
      return stakeInfo.staked > 0 ? stakeInfo.staked.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.0"
    }
    if(realizeToggle) {
      return balance.prg > 0 ? balance.prg.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.0"
    }
  }

  function handlePercentageButtons(action: number) {
    if(action == 1) {
      if(stakeToggle) {
        setDisplayString((balance.locks / 4).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setStake(balance.locks / 4)
      }
      if(unstakeToggle) {
        setDisplayString((stakeInfo.staked / 4).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setUnstake(stakeInfo.staked / 4)
      }
      if(realizeToggle) {
        setDisplayString((balance.prg / 4).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setRealize(balance.prg / 4)
      }
    }
    if(action == 2) {
      if(stakeToggle) {
        setDisplayString((balance.locks / 2).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setStake(balance.locks / 2)
      }
      if(unstakeToggle) {
        setDisplayString((stakeInfo.staked / 2).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setUnstake(stakeInfo.staked / 2)
      }
      if(realizeToggle) {
        setDisplayString((balance.prg / 2).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setRealize(balance.prg / 2)
      }
    }
    if(action == 3) {
      if(stakeToggle) {
        setDisplayString((balance.locks * 0.75).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setStake(balance.locks * 0.75)
      }
      if(unstakeToggle) {
        setDisplayString((stakeInfo.staked * 0.75).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setUnstake(stakeInfo.staked * 0.75)
      }
      if(realizeToggle) {
        setDisplayString((balance.prg * 0.75).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setRealize(balance.prg * 0.75)
      }
    }
    if(action == 4) {
      if(stakeToggle) {
        setDisplayString(balance.locks.toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setStake(balance.locks)
      }
      if(unstakeToggle) {
        setDisplayString(stakeInfo.staked.toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setUnstake(stakeInfo.staked)
      }
      if(realizeToggle) {
        setDisplayString(balance.prg.toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setRealize(balance.prg)
      }
    }
  }

  if(!initialRender) {
    return null
  }
  else {
    return (
      <>
        <Head>
          <title>mf staking</title>
        </Head>
        <div className="flex flex-row py-3">
          <animated.div className="w-[57%] flex flex-col pt-8 pb-2 px-16 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black" style={springs}>
            { popupToggle && 
              <div className="z-10 bg-white rounded-xl border-2 border-black w-36 h-36 left-[60%] top-[30%] absolute px-4">
                <span className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer" onClick={() => setPopupToggle(false)}>x</span>
                <p className="mt-10 mx-auto font-acme">burn n porridge to buy n locks at floor price</p>
              </div>
            }
            <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline" onClick={() => test()}>staking</h1>
            <div className="flex flex-row ml-2 items-center justify-between">
              <h3 className="font-acme text-[24px] ml-2">staking $locks for $porridge</h3>
              <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
                <div className={`font-acme w-20 py-2 ${stakeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(1)}>stake</div>
                <div className={`font-acme w-20 py-2 ${unstakeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(2)}>unstake</div>
                <div className={`font-acme w-20 py-2 ${realizeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} onClick={() => handlePill(3)}>stir <span className="ml-1 rounded-full px-2 border-2 border-black hover:bg-black hover:text-white" onClick={() => setPopupToggle(true)}>?</span></div>
              </div>
            </div>
            <div className="h-[100%] mt-4 flex flex-row">
              <div className="w-[60%] flex flex-col">
                <div className="rounded-3xl border-2 border-black w-[100%] h-[60%] bg-white flex flex-col relative">
                  <div className="flex flex-row items-center justify-between ml-10 mt-16">
                    <h1 className="font-acme text-[40px]">{renderLabel()}</h1>
                    <div className="flex flex-row items-center mr-6">
                      <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(1)}>25%</button>
                      <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(2)}>50%</button>
                      <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(3)}>75%</button>
                      <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(4)}>MAX</button>
                    </div>
                  </div>
                  <div className="absolute top-[45%]">
                    <input className="border-none focus:outline-none font-acme rounded-xl text-[40px] pl-10" placeholder="0.00" type="number" value={handleTopInput()} onChange={(e) => handleTopChange(e.target.value)} id="number-input" autoFocus />
                  </div>
                  <div className="absolute right-0 bottom-[35%]">
                    <h1 className="text-[23px] mr-6 font-acme text-[#878d97]">balance: {handleBalance()}</h1>
                  </div>
                </div>
                <div className="h-[15%] w-[80%] mx-auto mt-6">
                  <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
                </div>
              </div>
              <div className="flex flex-col w-[40%] h-[100%] mt-4 ml-4">
                <div className="w-[100%] h-[70%] flex p-6 flex-col bg-white rounded-xl border-2 border-black">
                  <div className="flex flex-row justify-between items-center mt-3">
                    <h1 className="font-acme text-[24px]">$LOCKS floor price:</h1>
                    <p className="font-acme text-[20px]">${(stakeInfo.fsl / stakeInfo.supply) > 0 ? (stakeInfo.fsl / stakeInfo.supply).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}</p>
                  </div>
                  <div className="flex flex-row justify-between items-center mt-3">
                    <h1 className="font-acme text-[24px]">$LOCKS balance:</h1>
                    <p className="font-acme text-[20px]">{balance.locks > 0 ? balance.locks.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}</p>
                  </div>
                  <div className="flex flex-row justify-between items-center mt-3">
                    <h1 className="font-acme text-[24px]">$HONEY balance:</h1>
                    <p className="font-acme text-[20px]">{balance.honey > 0 ? balance.honey.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}</p>
                  </div>
                  <div className="flex flex-row justify-between items-center mt-3">
                    <h1 className="font-acme text-[24px]">staked $LOCKS:</h1>
                    <p className="font-acme text-[20px]">{stakeInfo.staked > 0 ? stakeInfo.staked.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}</p>
                  </div>
                  <div className="flex flex-row justify-between items-center mt-3">
                    <h1 className="font-acme text-[24px]">$PRG balance:</h1>
                    <p className="font-acme text-[20px]">{balance.prg > 0 ? balance.prg.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}</p>
                  </div>
                  <div className="flex flex-row justify-between items-center mt-3">
                    <h1 className="font-acme text-[24px]">$PRG available to claim:</h1>
                    <p className="font-acme text-[20px]">{stakeInfo.yieldToClaim > 0 ? stakeInfo.yieldToClaim.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}</p>
                  </div>
                </div>
                {isConnected && <div className="h-[10%] w-[70%] mx-auto mt-4">
                  <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[25px]" id="claim-button" onClick={() => handleClaimFunction()}>claim yield</button>
                </div>}
              </div>
            </div>
          </animated.div>
          <Bear />
        </div>
      </>
    )
  }
}