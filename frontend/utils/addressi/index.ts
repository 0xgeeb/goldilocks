import { Contracts } from "../interfaces"
import borrowABI from "../abi/Borrow.json"
import porridgeABI from "../abi/Porridge.json"
import honeyABI from "../abi/Honey.json"
import gammABI from "../abi/GAMM.json"

export const contracts: Contracts = {
  gamm: {
    address: '0x114D8AfF1E94Fe896E260052A3BE641556aDc3e8',
    abi: gammABI.abi
  },
  porridge: {
    address: '0x9e6bDAb278E5cA66fFf5639A29A22962Fff40D32',
    abi: porridgeABI.abi
  } ,
  honey: {
    address: '0x83C098CFa401D0360Bd6291f3120073c9937F03D',
    abi: honeyABI.abi
  } ,
  borrow: {
    address: '0xD9EA8484063971ec56c7E6c606E4D065F36Ec6ea',
    abi: borrowABI.abi
  } 
}