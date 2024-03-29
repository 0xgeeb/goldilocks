import { Contracts } from "../interfaces"
import borrowABI from "../abi/Borrow.json"
import porridgeABI from "../abi/Porridge.json"
import honeyABI from "../abi/Honey.json"
import beraABI from "../abi/Bera.json"
import gammABI from "../abi/GAMM.json"
import faucetABI from "../abi/BeraFaucet.json"
import goldilendABI from "../abi/Goldilend.json"
import bondbearABI from "../abi/BondBear.json"
import bandbearABI from "../abi/BandBear.json"
import honeycombABI from "../abi/HoneyComb.json"
import beradromeABI from "../abi/Beradrome.json"

export const contracts: Contracts = {
  gamm: {
    address: '0x4d9dC113486aAafc4b40319eE05A128C792bb10C',
    abi: gammABI.abi
  },
  porridge: {
    address: '0x18A0Db5A6Ae6cBc317a11F8BD241fe1e9071dE5C',
    abi: porridgeABI.abi
  },
  borrow: {
    address: '0x746ed951978a9eFBf47137E1F6844bd8740B3B96',
    abi: borrowABI.abi
  },
  goldilend: {
    address: '0xB5dfc873f71748073F965fF6e8d510F44707eCb5',
    abi: goldilendABI.abi
  },
  bera: {
    address: '0xB0F2B8A4A0C4c71e3623Aa95fFE1E09f4568FDAC',
    abi: beraABI.abi
  },
  honey: {
    address: '0xeB7095ccbb4Ce4Bf72717e0fDc54f1a7f48E3F63',
    abi: honeyABI.abi
  },
  faucet: {
    address: '0x6c22bA412BAAf3B931dc18eBa10bF510b11577a7',
    abi: faucetABI.abi
  },
  bondbear: {
    address: '0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083',
    abi: bondbearABI.abi
  },
  bandbear: {
    address: '0x853fE59f27A9AC25422Cb6cEFb116126468D3025',
    abi: bandbearABI.abi
  },
  honeycomb: {
    address: '0xc8CA5f855203a05773F8529367c35c7cF6676E70',
    abi: honeycombABI.abi
  },
  beradrome: {
    address: '0x3017Fff986824372d26BE6c5695cB79414e0ca8c',
    abi: beradromeABI.abi
  }
}