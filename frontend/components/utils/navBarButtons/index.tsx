import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useWallet, useNotification } from "../../../providers"

type PopupProp = {
  setPopupToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NavBarButtons = ({ setPopupToggle }: PopupProp) => {

  const { openNotification } = useNotification()
  const { 
    isConnected, 
    network, 
    refreshBalances, 
    sendMintTx 
  } = useWallet()

  const handleButtonClick = async () => {
    const button = document.getElementById('honey-button')

    if(!isConnected) {
      button && (button.innerHTML = "where wallet")
    }
    else if(network !== "Goerli test network") {
      button && (button.innerHTML = "where goerli")
    }
    else {
      button && (button.innerHTML = "loading...")
      const mintTx = await sendMintTx()
      mintTx && openNotification({
        title: 'Successfully Minted $HONEY!',
        hash: mintTx,
        direction: 'minted',
        amount: 1000000,
        price: 0,
        page: 'nav'
      })
      button && (button.innerHTML = "u got $honey")
      refreshBalances()
      setTimeout(() => {
        button && (button.innerHTML = "$honey")
      }, 5000)
    }
  }

  const loadingElement = () => {
    return <span className="loader-small"></span>
  }

  return (
    <div className="flex-row justify-between w-[55%] 2xl:w-[50%] hidden lg:flex">
      <div className="flex flex-row">
        <button 
          className={`w-36 py-2 text-[16px] 2xl:text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme`} 
          id="honey-button" 
          onClick={() => handleButtonClick()}
        >
          $honey
        </button>
        <a href="https://core.app/tools/testnet-faucet" target="_blank">
          <button 
            className="w-20 2xl:w-24 py-2 text-[16px] 2xl:text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl font-acme" 
            id="home-button"
          >
            faucet
          </button>
        </a>
      </div>
      <div className="flex flex-row">
        <a href="/gamm">
          <button 
            className="w-20 2xl:w-24 py-2 text-[16px] 2xl:text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" 
            id="home-button"
          >
            gamm
          </button>
        </a>
        <a href="/staking">
          <button 
            className="w-20 2xl:w-24 py-2 text-[16px] 2xl:text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" 
            id="home-button"
          >
            stake
          </button>
        </a>
        <a href="/borrowing">
          <button 
            className="w-20 2xl:w-24 py-2 text-[16px] 2xl:text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" 
            id="home-button"
          >
            borrow
          </button>
        </a>
        <a href="/goldilend">
          <button 
            className="w-20 2xl:w-24 py-2 text-[16px] 2xl:text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" 
            id="home-button"
          >
            goldilend
          </button>
        </a>
        <ConnectButton.Custom>
          {({
            account,
            mounted,
            openConnectModal
          }) => {
            return (
              !mounted ?
                <button 
                  className={`w-20 2xl:w-24 py-2 text-[16px] 2xl:text-[18px] bg-[#ffff00] hover:scale-[120%] rounded-xl mr-4 font-acme`}
                  id="connect-button"
                >
                  {loadingElement()}
                </button> :
              !account ?
                <button
                  className={`w-20 2xl:w-24 py-2 text-[16px] 2xl:text-[18px] bg-[#ffff00] hover:scale-[120%] rounded-xl mr-4 font-acme`}
                  id="connect-button"
                  onClick={openConnectModal}
                >
                  connect
                </button> :
                <button 
                  className={`w-20 2xl:w-24 py-2 text-[16px] 2xl:text-[18px] bg-green-400 hover:scale-[120%] rounded-xl mr-4 font-acme`}
                  id="home-button"
                  onClick={() =>setPopupToggle(true)}
                >
                  {`${account.address.slice(0, 4)}...${account?.address.slice(-3)}`}
                </button>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  )
}