import sys
sys.path.append('price_tests')
from market_functions import sell
from eth_abi import encode

fsl = 1400000
psl = 400000
supply = 5000
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
target = 0.36

sold = 0
while(sold < 900):
  fsl, psl, supply, floor_price, market_price = sell(10, fsl, psl, supply, floor_price, market_price)
  sold += 10

market_price *= (10 ** 18)
enc = encode(['uint256'], [int(market_price)])
print("0x" + enc.hex())