import { Contracts } from "../../interfaces"
import borrowABI from "./../abi/Borrow.json"
import locksABI from "./../abi/Locks.json"
import porridgeABI from "./../abi/Porridge.json"
import testhoneyABI from "./../abi/TestHoney.json"
import ammABI from "./../abi/AMM.json"

export const contracts: Contracts = {
  amm: {
    address: '0x1b5F6509B8b4Dd5c9637C8fa6a120579bE33666F',
    abi: ammABI.abi
  },
  locks: {
    address: '0x461B8AdEDe13Aa786b3f14b05496B93c5148Ad51',
    abi: locksABI.abi
  } ,
  porridge: {
    address: '0x69B228b9247dF2c1F194f92fC19A340A9F2803f7',
    abi: porridgeABI.abi
  } ,
  honey: {
    address: '0x29b9439E09d1D581892686D9e00E3481DCDD5f78',
    abi: testhoneyABI.abi
  } ,
  borrow: {
    address: '0x1b408d277D9f168A8893b1728d3B6cb75929a67d',
    abi: borrowABI.abi
  } 
}