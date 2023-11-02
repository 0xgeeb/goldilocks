import sys
sys.path.append('price_tests')
from market_functions import buy, floor_raise
from eth_abi import encode

fsl = 8700000
psl = 1900000
supply = 2364
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
target = 0.36

bought = 0
while(bought < 8000):
  fsl, psl, supply, floor_price, market_price = buy(40, fsl, psl, supply, floor_price, market_price)
  target, fsl, psl, supply, floor_price, market_price = floor_raise(target, fsl, psl, supply, floor_price, market_price)
  bought += 40

market_price *= (10 ** 18)
enc = encode(['uint256'], [int(market_price)])
print("0x" + enc.hex())