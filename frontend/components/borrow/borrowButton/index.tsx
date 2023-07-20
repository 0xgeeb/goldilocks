import { 
  useBorrowing, 
  useWallet,
  useNotification
} from "../../../providers"
import { useBorrowingTx } from "../../../hooks/borrowing"

export const BorrowButton = () => {

  const {
    activeToggle,
    borrowInfo,
    borrow,
    repay,
    setBorrow,
    setRepay,
    setDisplayString,
    refreshBorrowInfo
  } = useBorrowing()

  const {
    wallet,
    isConnected,
    network,
    refreshBalances
  } = useWallet()

  const {
    checkAllowance,
    sendApproveTx,
    sendBorrowTx,
    sendRepayTx
  } = useBorrowingTx()
  
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
      if(activeToggle === 'borrow') {
        if(borrow == 0) {
          return
        }
        button && (button.innerHTML = "borrowing...")
        const borrowTx = await sendBorrowTx(borrow)
        borrowTx && openNotification({
          title: 'Successfully Borrowed $HONEY!',
          hash: borrowTx,
          direction: 'borrowed',
          amount: borrow,
          price: 0,
          page: 'borrow'
        })
        button && (button.innerHTML = "borrow")
        setBorrow(0)
        setDisplayString('')
        refreshBalances()
        refreshBorrowInfo()
      }
      if(activeToggle === 'repay') {
        if(repay == 0) {
          return
        }
        const sufficientAllowance: boolean | void = await checkAllowance(repay, wallet)
        if(sufficientAllowance) {
          button && (button.innerHTML = "repaying...")
          const repayTx = await sendRepayTx(repay)
          repayTx && openNotification({
            title: 'Successfully Repaid $HONEY!',
            hash: repayTx,
            direction: 'repaid',
            amount: repay,
            price: 0,
            page: 'borrow'
          })
          button && (button.innerHTML = "repay")
          setRepay(0)
          setDisplayString('')
          refreshBalances()
          refreshBorrowInfo()
        }
        else {
          button && (button.innerHTML = "approving...")
          await sendApproveTx(repay)
          setTimeout(() => {
            button && (button.innerHTML = "repay")
          }, 10000)
        }
      }
    }
  }
  
  const renderButton = () => {
    if(activeToggle === 'borrow') {
      return 'borrow'
    }
    if(activeToggle === 'repay') {
      if(repay > borrowInfo.honeyBorrowAllowance) {
        return 'approve use of $honey'
      }
      return 'repay'
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