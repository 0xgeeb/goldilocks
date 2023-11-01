import sys
sys.path.append('price_tests')
from market_functions import buy, sell, redeem, floor_raise
from eth_abi import encode

fsl = 973000
psl = 360000
supply = 6780
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
target = 0.36

transactions = [
  (buy, 652.3),
  (floor_raise, None),
  (redeem, 71.9),
  (floor_raise, None),
  (buy, 32),
  (floor_raise, None),
  (redeem, 298),
  (floor_raise, None),
  (buy, 53),
  (floor_raise, None),
  (sell, 31.7),
  (buy, 286),
  (floor_raise, None),
  (sell, 65.1),
  (redeem, 32),
  (floor_raise, None),
  (buy, 4.7),
  (floor_raise, None),
  (buy, 123),
  (floor_raise, None),
]

for transaction, amount in transactions:
  if transaction == floor_raise:
    target, fsl, psl, supply, floor_price, market_price = transaction(target, fsl, psl, supply, floor_price, market_price)
  else:
    fsl, psl, supply, floor_price, market_price = transaction(amount, fsl, psl, supply, floor_price, market_price)

market_price *= (10 ** 18)
enc = encode(['uint256'], [int(market_price)])
print("0x" + enc.hex())