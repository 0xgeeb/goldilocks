import random
#assuming 2 million dollar presale and 1000 initial supply
fsl = 95.1
supply = 1
psl = 4.9
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
#target ratio
target = 0.26
#invested tracks the net amount of capital that has been deposited into the protocol
#it subtracts the amount withdrawn on sales
invested = 0
#tracks amount in treasury and amount to be added to treasury on buys
treasury= 0
treasury_share = 0.18
high_ratio_treasury_share = 0.25
#prints initial market price
print("Price:", market_price, "Floor price:", floor_price)

def redeem(_amount):
  global supply
  global fsl
  global psl
  global floor_price
  global market_price
  supply -=_amount
  fsl -= floor_price*_amount
  floor_price = fsl/supply
  market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
  return market_price

def sell(amount):
  global invested
  global supply
  global fsl
  global psl
  global floor_price
  global market_price
  sale_price = 0
  while amount >= 1:
    amount -= 1
    supply -= 1
    sale_price += market_price
    fsl -= floor_price
    psl -= (market_price - floor_price)
    floor_price = fsl/supply
    market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
  supply -= amount
  sale_price += market_price*amount
  fsl -= floor_price*amount
  psl -= (market_price - floor_price)*amount
  tax = sale_price*0.053
  fsl+= tax
  floor_price = fsl/max(supply, 1)
  market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
  invested -= (sale_price - tax)    
  return market_price

def buy(amount):
  global invested
  global supply
  global fsl
  global psl
  global floor_price
  global market_price
  global target
  global treasury
  global treasury_share
  global high_ratio_treasury_share
  floor_price = fsl/supply
  market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
  purchase_price = 0
  while amount >=1:
    amount -= 1
    supply += 1
    purchase_price += market_price
    #if psl/fsl >= 0.36, all deposited capital goes to fsl/treasury
    if psl/fsl >= 0.36:
      fsl += market_price*(1 - high_ratio_treasury_share)
      treasury += market_price*high_ratio_treasury_share
      floor_price = fsl/supply
      market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)
      #print("too high")
    else:
      fsl += floor_price
      psl += (market_price - floor_price)*(1 - treasury_share)
      treasury += (market_price - floor_price)*treasury_share
      market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)  
  supply += amount
  purchase_price += market_price*amount
  if psl/fsl >= 0.36:
    fsl += market_price*amount*(1 - high_ratio_treasury_share)
    treasury += market_price*amount*high_ratio_treasury_share
    floor_price = fsl/supply
  else:
    fsl += floor_price*amount
    psl += (market_price - floor_price)*amount*(1 - treasury_share)
    treasury += (market_price - floor_price)*amount*treasury_share
  tax = purchase_price*0.003
  fsl += tax
  floor_price = fsl/supply
  market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)
  invested += purchase_price
  if treasury >= 100:
    treasury_share = 0
    high_ratio_treasury_share = 0
  #print("Price:", market_price, "Floor price:", floor_price)
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
    #print("Floor raise! Ratio:", psl/fsl)
  return 'raise'

#same as previous test except we set treasury share to 0 once the treasury value goes over 100
bought = 0
while(bought < 10000):
  buy(12.5)
  floor_raise()
  bought += 12.5
  print("Price:", market_price, "Floor price:", floor_price)
print("fsl:", fsl)
print("psl:", psl)
print("supply:", supply)
print("treasury:", treasury)