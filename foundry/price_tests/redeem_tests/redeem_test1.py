import sys
sys.path.append('price_tests')
from market_functions import redeem, floor_raise
from eth_abi import encode

fsl = 1400000
psl = 400000
supply = 5000
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
target = 0.36

redeemed = 0
while(redeemed < 400):
  fsl, psl, supply, floor_price, market_price = redeem(10, fsl, psl, supply, floor_price, market_price)
  target, fsl, psl, supply, floor_price, market_price = floor_raise(target, fsl, psl, supply, floor_price, market_price)
  redeemed += 10

market_price *= (10 ** 18)
enc = encode(['uint256'], [int(market_price)])
print("0x" + enc.hex())