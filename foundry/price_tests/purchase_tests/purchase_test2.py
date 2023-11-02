import sys
sys.path.append('price_tests')
from market_functions import buy, floor_raise
from eth_abi import encode

fsl = 1400000
psl = 400000
supply = 5000
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
target = 0.36

bought = 0
while(bought < 55):
  fsl, psl, supply, floor_price, market_price = buy(2.5, fsl, psl, supply, floor_price, market_price)
  target, fsl, psl, supply, floor_price, market_price = floor_raise(target, fsl, psl, supply, floor_price, market_price)
  bought += 2.5

market_price *= (10 ** 18)
enc = encode(['uint256'], [int(market_price)])
print("0x" + enc.hex())