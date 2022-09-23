import random

fsl = 75
supply = 110
psl = 25
reserves = fsl+psl
floor_price = fsl/supply
exponent = 2.7
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**exponent)
ratio = psl/fsl
target = 0.5
print(market_price)

def buy(amount):
  global exponent
  global supply
  global fsl
  global psl
  global reserves
  global floor_price
  global market_price
  global target
  for i in range(0, amount):
    supply += 1
    fsl += floor_price
    psl += (market_price - floor_price)
    reserves = fsl+psl
    if psl/fsl >= target:
      transfer = psl*0.05
      psl -= transfer
      fsl += transfer
      floor_price = fsl/supply
      target = target*1.1
      print("Floor raise!")
    market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))*exponent)
    print("price:", market_price, "Floor price:", floor_price)
  return market_price

def sell(amount):
  global exponent
  global supply
  global fsl
  global psl
  global reserves
  global floor_price
  global market_price
  for i in range(0, amount):
    if supply >= 0:
      supply -= 1
      fsl -= floor_price
      psl -= (market_price - floor_price)
      reserves = fsl+psl
      market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))*exponent)
      tax = market_price*0.05
      fsl+= tax
      floor_price = fsl/max(supply, 1)
      print("price:", market_price, "Floor price:", floor_price)
  return market_price

buy(130)
sell(130)

"""
for i in range(0, 150):
  rando = random.random()
  if rando >= 0.3:
    buy(1)
  else:
    sell(1)
"""