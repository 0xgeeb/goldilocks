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

  const refreshInfo = () => {
    setBorrow(0)
    setRepay(0)
    setDisplayString('')
    refreshBalances()
    refreshBorrowInfo()
  }

  const borrowTxFlow = async (button: HTMLElement | null) => {
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
    refreshInfo()
  }

  const repayTxFlow = async (button: HTMLElement | null) => {
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
      refreshInfo()
    }
    else {
      button && (button.innerHTML = "approving...")
      await sendApproveTx(repay)
      setTimeout(() => {
        button && (button.innerHTML = "repay")
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
      if(activeToggle === 'borrow') {
        borrowTxFlow(button)
      }
      if(activeToggle === 'repay') {
        repayTxFlow(button)
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