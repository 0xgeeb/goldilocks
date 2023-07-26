import { Contracts } from "../interfaces"
import borrowABI from "../abi/Borrow.json"
import porridgeABI from "../abi/Porridge.json"
import honeyABI from "../abi/Honey.json"
import gammABI from "../abi/GAMM.json"

export const contracts: Contracts = {
  gamm: {
    address: '0x1D5D39feDD3BB60212066597641d72641A0ED782',
    abi: gammABI.abi
  },
  porridge: {
    address: '0x2A9249bB56839D044b90d01e7949a3dDcaC7DA44',
    abi: porridgeABI.abi
  } ,
  honey: {
    address: '0x75Dd4262f3D1D1d54eCCCF0eb4c5D810d95233b7',
    abi: honeyABI.abi
  } ,
  borrow: {
    address: '0x4bb62DA9422BE67DBd992658ed652300097E9A85',
    abi: borrowABI.abi
  } 
}