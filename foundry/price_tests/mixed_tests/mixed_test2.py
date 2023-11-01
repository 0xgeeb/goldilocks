import sys
sys.path.append('price_tests')
from market_functions import buy, sell, redeem, floor_raise
from eth_abi import encode

fsl = 1400000
psl = 400000
supply = 5000
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
target = 0.36

transactions = [
  (buy, 6.5),
  (floor_raise, None),
  (redeem, 7.1),
  (floor_raise, None),
  (buy, 3.2),
  (floor_raise, None),
  (redeem, 2.9),
  (floor_raise, None),
  (buy, 5),
  (floor_raise, None),
  (sell, 3.1),
  (buy, 2.8),
  (floor_raise, None),
  (sell, 6),
  (redeem, 3.2),
  (floor_raise, None),
  (buy, 4),
  (floor_raise, None),
  (buy, 10),
  (floor_raise, None)
]


for transaction, amount in transactions:
  if transaction == floor_raise:
    target, fsl, psl, supply, floor_price, market_price = transaction(target, fsl, psl, supply, floor_price, market_price)
  else:
    fsl, psl, supply, floor_price, market_price = transaction(amount, fsl, psl, supply, floor_price, market_price)

market_price *= (10 ** 18)
enc = encode(['uint256'], [int(market_price)])
print("0x" + enc.hex())