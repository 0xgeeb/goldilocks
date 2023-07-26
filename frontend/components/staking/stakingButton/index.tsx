import {
  useStaking,
  useWallet,
  useNotification
} from "../../../providers"
import { useStakingTx } from "../../../hooks/staking"

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
    isConnected,
    network,
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

    if(!isConnected) {
      button && (button.innerHTML = "where wallet")
    }
    else if(network !== "Avalanche Fuji C-Chain") {
      button && (button.innerHTML = "switch to fuji plz")
    }
    else {
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
  }

  const renderButton = () => {
    if(activeToggle === 'stake') {
      if(stake > stakingInfo.locksPrgAllowance) {
        return 'approve use of $locks'
      }
      return 'stake'
    }
    if(activeToggle === 'unstake') {
      return 'unstake'
    }
    if(activeToggle === 'realize') {
      if(realize > stakingInfo.honeyPrgAllowance) {
        return 'approve use of $honey'
      }
      return 'stir'
    }
  }

  return (
    <div className="h-[13%] 2xl:h-[15%] w-[75%] 2xl:w-[80%] mx-auto mt-6">
      <button 
        className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[25px] 2xl:text-[30px]" 
        id="amm-button" 
        onClick={() => handleButtonClick()}
      >
        {renderButton()}
      </button>
    </div>
  )
}