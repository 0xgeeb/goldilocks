import { Contracts } from "../interfaces"
import borrowABI from "../abi/Borrow.json"
import porridgeABI from "../abi/Porridge.json"
import honeyABI from "../abi/Honey.json"
import gammABI from "../abi/GAMM.json"
import faucetABI from "../abi/BeraFaucet.json"
import goldilendABI from "../abi/Goldilend.json"

export const contracts: Contracts = {
  gamm: {
    address: '0x4d9dC113486aAafc4b40319eE05A128C792bb10C',
    abi: gammABI.abi
  },
  porridge: {
    address: '0x18A0Db5A6Ae6cBc317a11F8BD241fe1e9071dE5C',
    abi: porridgeABI.abi
  },
  honey: {
    address: '0xeB7095ccbb4Ce4Bf72717e0fDc54f1a7f48E3F63',
    abi: honeyABI.abi
  },
  borrow: {
    address: '0x746ed951978a9eFBf47137E1F6844bd8740B3B96',
    abi: borrowABI.abi
  },
  faucet: {
    address: '0x6c22bA412BAAf3B931dc18eBa10bF510b11577a7',
    abi: faucetABI.abi
  },
  goldilend: {
    address: '0xB5dfc873f71748073F965fF6e8d510F44707eCb5',
    abi: goldilendABI.abi
  }
}