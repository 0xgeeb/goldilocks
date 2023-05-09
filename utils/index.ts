import { Contracts } from "./interfaces"
import borrowABI from "../utils/abi/Borrow.json"
import locksABI from "../utils/abi/Locks.json"
import porridgeABI from "../utils/abi/Porridge.json"
import honeyABI from "../utils/abi/Honey.json"
import ammABI from "../utils/abi/AMM.json"

export const contracts: Contracts = {
  amm: {
    address: '0x3593F7A6219F4E73EB58D46Ec3480B531c8460d4',
    abi: ammABI.abi
  },
  locks: {
    address: '0x597fa8C9812fAae97bb45863B554d1473711BE2c',
    abi: locksABI.abi
  } ,
  porridge: {
    address: '0x3fEC74290225A9453B71A1a7a9ABf287C99526fb',
    abi: porridgeABI.abi
  } ,
  honey: {
    address: '0x915b170161000699f7bdD25A6DbB453cE72993e5',
    abi: honeyABI.abi
  } ,
  borrow: {
    address: '0xCC08930D0eCc7558231ae0bc955E767a840FD4BB',
    abi: borrowABI.abi
  } 
}