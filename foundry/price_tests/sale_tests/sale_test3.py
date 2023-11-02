import sys
sys.path.append('price_tests')
from market_functions import sell
from eth_abi import encode

fsl = 800000
psl = 200000
supply = 1000
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
target = 0.36

sold = 0
while(sold < 975):
  fsl, psl, supply, floor_price, market_price = sell(25, fsl, psl, supply, floor_price, market_price)
  sold += 25

market_price *= (10 ** 18)
enc = encode(['uint256'], [int(market_price)])
print("0x" + enc.hex())