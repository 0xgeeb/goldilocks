import { Contracts } from "../interfaces"
import borrowABI from "../abi/Borrow.json"
import porridgeABI from "../abi/Porridge.json"
import honeyABI from "../abi/Honey.json"
import gammABI from "../abi/GAMM.json"

export const contracts: Contracts = {
  gamm: {
    address: '0x2f9145825CDCAF96305b8372d7355A053D83555b',
    abi: gammABI.abi
  },
  porridge: {
    address: '0x877e5657b234e864D6c09a7DE3E06d8e384a1894',
    abi: porridgeABI.abi
  } ,
  honey: {
    address: '0xf0d4E88ed8C797049888C49Fd0202907B8ACa031',
    abi: honeyABI.abi
  } ,
  borrow: {
    address: '0x57b60f98d40E48dEffE501a8544e709AD4a74bF1',
    abi: borrowABI.abi
  } 
}