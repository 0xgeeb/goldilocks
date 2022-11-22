import random
#assuming 2 million dollar presale and 1000 initial supply
fsl = 1600000
supply = 1000
psl = 400000
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
#target ratio
target = 0.26
#invested tracks the net amount of capital that has been deposited into the protocol
#it subtracts the amount withdrawn on sales
invested = 0
#prints initial market price
# print(market_price)

def sell(amount):
  global invested
  global supply
  global fsl
  global psl
  global floor_price
  global market_price
  for i in range(0, amount):
    if supply > 0:
      supply -= 1
      fsl -= floor_price
      psl -= (market_price - floor_price)
      market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
      #includes sell tax and transaction fee
      tax = market_price*0.053
      fsl+= tax
      floor_price = fsl/max(supply, 1)
      invested -= (market_price - tax)
      # print("Price:", market_price, "Floor price:", floor_price)
  return market_price

def buy(amount):
  global invested
  global supply
  global fsl
  global psl
  global floor_price
  global market_price
  global target
  purchase_price = 0
  for i in range(0, amount):
    supply += 1
    purchase_price += market_price
    #if psl/fsl >= 0.5, all deposited capital goes to fsl
    if psl/fsl >= 0.5:
      fsl += market_price
      floor_price = fsl/supply
    else:
      fsl += floor_price
      psl += (market_price - floor_price)
      ratio = psl/fsl
    market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)  
    invested += market_price
    # print("Price:", market_price, "Floor price:", floor_price)
  tax = purchase_price*0.003
  fsl += tax
  invested += tax
  floor_price = fsl/supply
  market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)
  # print("Price:", market_price, "Floor price:", floor_price)
  return market_price

def floor_raise():
  global invested
  global supply
  global fsl
  global psl
  global floor_price
  global market_price
  global target
  ratio = psl/fsl
  if ratio >= target:
    multiplier = (0.01*ratio)/0.32                   
    transfer = psl*multiplier
    psl -= transfer
    fsl += transfer
    floor_price = fsl/supply
    target = target*1.02
    floor_price = fsl/supply
    market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)  
    print("Floor raise! Ratio:", psl/fsl)
  return 'raise'
  
#just a random buy/sell pattern to compare against what happens when you trade through the contracts
print(buy(38))
floor_raise()
print(sell(5))
print(sell(30))
print(buy(10))
floor_raise()
print(sell(20))
print(sell(10))
print(buy(15))
floor_raise()
print(sell(10))
print(sell(12))
print(buy(45))
floor_raise()
print(buy(8))
floor_raise()
print(sell(8))
print(buy(45))
floor_raise()
print(buy(45))
floor_raise()
print(buy(45))
floor_raise()
print(sell(25))
print(buy(45))
floor_raise()
print(buy(45))
floor_raise()
print(buy(12))
floor_raise()
print(sell(48))
# print("psl:", psl)
# print("fsl:",fsl)
# print("supply:",supply)
# print("market price:", market_price)