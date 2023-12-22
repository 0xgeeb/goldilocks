import {
  useStaking,
  useWallet,
  useNotification
} from "../../../providers"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useStakingTx } from "../../../hooks"

export const StakingButton = () => {

  const {
    activeToggle,
    stakingInfo,
    stake,
    unstake,
    realize,
    setStake,
    setUnstake,
    setRealize,
    setDisplayString,
    refreshStakingInfo
  } = useStaking()

  const {
    wallet,
    balance,
    isConnected,
    refreshBalances
  } = useWallet()

  const {
    checkAllowance,
    sendApproveTx,
    sendStakeTx,
    sendUnstakeTx,
    sendRealizeTx
  } = useStakingTx()

  const { openNotification } = useNotification()

  const refreshInfo = () => {
    setStake(0)
    setUnstake(0)
    setRealize(0)
    setDisplayString('')
    refreshBalances()
    refreshStakingInfo()
  }

  const stakeTxFlow = async (button: HTMLElement | null) => {
    if(stake == 0) {
      button && (button.innerHTML = "stake")
      return
    }
    if(stake > balance.locks) {
      button && (button.innerHTML = "insufficient balance")
      return
    }
    const sufficientAllowance: boolean | void = await checkAllowance(stake, 'locks', wallet)
    if(sufficientAllowance) {
      button && (button.innerHTML = "staking...")
      const stakeTx = await sendStakeTx(stake)
      stakeTx && openNotification({
        title: 'Successfully Staked $LOCKS!',
        hash: stakeTx,
        direction: 'staked',
        amount: stake,
        price: 0,
        page: 'stake'
      })
      button && (button.innerHTML = "stake")
      refreshInfo()
    }
    else {
      button && (button.innerHTML = "approving...")
      await sendApproveTx(stake, 'locks')
      setTimeout(() => {
        button && (button.innerHTML = "stake")
      }, 10000)
    }
  }

  const unstakeTxFlow = async (button: HTMLElement | null) => {
    if(unstake == 0) {
      button && (button.innerHTML = "unstake")
      return
    }
    if(unstake > balance.locked) {
      button && (button.innerHTML = "$locks are borrowed against")
      return
    }
    if(unstake > balance.staked) {
      button && (button.innerHTML = "insufficient balance")
      return
    }
    button && (button.innerHTML = "unstaking...")
    const unstakeTx = await sendUnstakeTx(unstake)
    unstakeTx && openNotification({
      title: 'Successfully Unstaked $LOCKS!',
      hash: unstakeTx,
      direction: 'unstaked',
      amount: unstake,
      price: 0,
      page: 'stake'
    })
    button && (button.innerHTML = "unstake")
    refreshInfo()
  }

  const realizeTxFlow = async (button: HTMLElement | null) => {
    if(realize == 0) {
      button && (button.innerHTML = "realize")
      return
    }
    if(realize > balance.prg) {
      button && (button.innerHTML = "insufficient balance")
      return
    }
    const sufficientAllowance: boolean | void = await checkAllowance(realize, 'honey', wallet)
    if(sufficientAllowance) {
      button && (button.innerHTML = "stirring...")
      const realizeTx = await sendRealizeTx(realize)
      realizeTx && openNotification({
        title: 'Successfully Stirred $LOCKS!',
        hash: realizeTx,
        direction: 'stirred',
        amount: realize,
        price: 0,
        page: 'stake'
      })
      button && (button.innerHTML = "realize")
      refreshInfo()
    }
    else {
      button && (button.innerHTML = "approving...")
      await sendApproveTx(realize * (stakingInfo.fsl / stakingInfo.supply), 'honey')
      setTimeout(() => {
        button && (button.innerHTML = "realize")
      }, 10000)
    }
  }

  const handleButtonClick = async () => {
    const button = document.getElementById('amm-button')
    if(activeToggle === 'stake') {
      stakeTxFlow(button)
    }
    if(activeToggle === 'unstake') {
      unstakeTxFlow(button)
    }
    if(activeToggle === 'realize') {
      realizeTxFlow(button)
    }
  }

  const renderButton = () => {
    if(activeToggle === 'stake') {
      if(isConnected && stake > stakingInfo.locksPrgAllowance && balance.locks >= stake) {
        return 'approve use of $locks'
      }
      return 'stake'
    }
    if(activeToggle === 'unstake') {
      return 'unstake'
    }
    if(activeToggle === 'realize') {
      if(isConnected && realize > stakingInfo.honeyPrgAllowance && balance.prg >= realize) {
        return 'approve use of $honey'
      }
      return 'stir'
    }
  }

  return (
    <div className="h-[13%] 2xl:h-[15%] w-[75%] 2xl:w-[80%] mx-auto mt-6">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openConnectModal,
          openChainModal
        }) => {
          return (
            <button 
              className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[25px] 2xl:text-[30px]" 
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
              {renderButton()}
            </button>
          )
        }}
      </ConnectButton.Custom>
    </div>
  )
}