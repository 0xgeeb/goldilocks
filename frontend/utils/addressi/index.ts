import { Contracts } from "../interfaces"
import borrowABI from "../abi/Borrow.json"
import porridgeABI from "../abi/Porridge.json"
import honeyABI from "../abi/Honey.json"
import gammABI from "../abi/GAMM.json"

export const contracts: Contracts = {
  gamm: {
    address: '0x5FA09df51e5A7a843899C84AAC6504e50e49964c',
    abi: gammABI.abi
  },
  porridge: {
    address: '0xba8fcCBBFAE7722583468986b76D622E9D8c305a',
    abi: porridgeABI.abi
  } ,
  honey: {
    address: '0x3F70b36AF93945acc87D4fD4b1c5dE3A382Bb349',
    abi: honeyABI.abi
  } ,
  borrow: {
    address: '0x7514d69F17674F552bf7405598210092d15d7A28',
    abi: borrowABI.abi
  } 
}