import sys
sys.path.append('price_tests')
from market_functions import buy, sell, floor_raise
from eth_abi import encode

fsl = 1400000
psl = 400000
supply = 5000
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
target = 0.36

transactions = [
  (buy, 38),
  (floor_raise, None),
  (sell, 45),
  (sell, 30),
  (buy, 10),
  (floor_raise, None),
  (sell, 20),
  (sell, 10),
  (buy, 15),
  (floor_raise, None),
  (sell, 10),
  (sell, 12),
  (buy, 45),
  (floor_raise, None),
  (buy, 8),
  (floor_raise, None),
  (sell, 8),
  (buy, 45),
  (floor_raise, None),
  (buy, 45),
  (floor_raise, None),
  (buy, 45),
  (floor_raise, None),
  (sell, 25),
  (buy, 45),
  (floor_raise, None),
  (buy, 45),
  (floor_raise, None),
  (buy, 12),
  (floor_raise, None),
  (sell, 48)
]

for transaction, amount in transactions:
  if transaction == floor_raise:
    target, fsl, psl, supply, floor_price, market_price = transaction(target, fsl, psl, supply, floor_price, market_price)
  else:
    fsl, psl, supply, floor_price, market_price = transaction(amount, fsl, psl, supply, floor_price, market_price)

market_price *= (10 ** 18)
enc = encode(['uint256'], [int(market_price)])
print("0x" + enc.hex())