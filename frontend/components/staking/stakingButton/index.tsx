import {
  useStaking,
  useWallet,
  useNotification
} from "../../../providers"

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
    refreshStakingInfo,
    checkAllowance,
    sendApproveTx,
    sendStakeTx,
    sendUnstakeTx,
    sendRealizeTx,
  } = useStaking()
  const {
    isConnected,
    network,
    refreshBalances
  } = useWallet()
  const { openNotification } = useNotification()

  const handleButtonClick = async () => {
    const button = document.getElementById('amm-button')

    if(!isConnected) {
      button && (button.innerHTML = "connect wallet")
    }
    else if(network !== "Avalanche Fuji C-Chain") {
      button && (button.innerHTML = "switch to devnet plz")
    }
    else {
      if(activeToggle === 'stake') {
        if(stake == 0) {
          return
        }
        const sufficientAllowance: boolean | void = await checkAllowance(stake, 'locks')
        if(sufficientAllowance) {
          button && (button.innerHTML = "staking...")
          const stakeTx = await sendStakeTx(stake)
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
          refreshBalances()
          refreshStakingInfo()
        }
        else {
          button && (button.innerHTML = "approving...")
          await sendApproveTx(stake, 'locks')
          setTimeout(() => {
            button && (button.innerHTML = "stake")
          }, 10000)
        }
      }
      if(activeToggle === 'unstake') {
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
        setUnstake(0)
        setDisplayString('')
        refreshBalances()
        refreshStakingInfo()
      }
      if(activeToggle === 'realize') {
        if(realize == 0) {
          return
        }
        const sufficientAllowance: boolean | void = await checkAllowance(realize, 'honey')
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
          setRealize(0)
          setDisplayString('')
          refreshBalances()
          refreshStakingInfo()
        }
        else {
          button && (button.innerHTML = "approving...")
          //todo: may have to multiply this by floor
          await sendApproveTx(realize, 'honey')
          setTimeout(() => {
            button && (button.innerHTML = "realize")
          }, 10000)
        }
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
    <div className="h-[15%] w-[80%] mx-auto mt-6">
      <button 
        className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[30px]" 
        id="amm-button" 
        onClick={() => handleButtonClick()}
      >
        {renderButton()}
      </button>
    </div>
  )
}