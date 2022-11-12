import random
#assuming 2 million dollar presale and 1000 initial supply
fsl = 1600000
supply = 1000
psl = 400000
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
#target ratio
target = 0.3
#invested tracks the net amount of capital that has been deposited into the protocol
#it subtracts the amount withdrawn on sales
invested = 0
#prints initial market price
print(market_price)

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
      print("Price:", market_price, "Floor price:", floor_price)
  return market_price

def buy(amount):
  global invested
  global supply
  global fsl
  global psl
  global floor_price
  global market_price
  global target
  for i in range(0, amount):
    supply += 1
    #if psl/fsl >= 0.5, all deposited capital goes to fsl
    if psl/fsl >= 0.5:
      fsl += market_price
      floor_price = fsl/supply
    else:
      fsl += floor_price
      psl += (market_price - floor_price)
      ratio = psl/fsl
      if ratio >= target:
        multiplier = (0.01*ratio)/0.32                   
        transfer = psl*multiplier
        psl -= transfer
        fsl += transfer
        floor_price = fsl/supply
        target = target*1.02
        print("Floor raise! Ratio:", psl/fsl)
    market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)  
    invested += market_price
    print("Price:", market_price, "Floor price:", floor_price)
  return market_price

#tracks what happens when 1.8 million dollars worth of sells occur continuously with no buys
#this is what would happen if all presalers except for the team dumped at once
while(invested > -1800000):
  sell(1)
print(fsl)
print(psl)
print(supply)