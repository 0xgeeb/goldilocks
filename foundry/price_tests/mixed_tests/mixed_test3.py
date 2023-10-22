import random
from eth_abi import encode
#varing initial fsl/psl/supply
fsl = 973000
supply = 6780
psl = 360000
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
#target ratio
target = 0.36
#invested tracks the net amount of capital that has been deposited into the protocol
#it subtracts the amount withdrawn on sales
invested = 0
#prints initial market price
# print(market_price)

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
  fsl+= tax/2
  psl+= tax/2
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
  floor_price = fsl/supply
  market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
  purchase_price = 0
  while amount >=1:
    amount -= 1
    supply += 1
    purchase_price += market_price
    # if psl/fsl >= 0.36: all deposited capital goes to fsl
    if psl/fsl >= 0.5:
      fsl += market_price
      floor_price = fsl/supply
    else:
      fsl += floor_price
      psl += (market_price - floor_price)
      ratio = psl/fsl
    market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)  
    invested += market_price
  supply += amount
  purchase_price += market_price*amount
  if psl/fsl >= 0.50:
    fsl += market_price*amount
    floor_price = fsl/supply
  else:
    fsl += floor_price*amount
    psl += (market_price - floor_price)*amount
    ratio = psl/fsl
  tax = purchase_price*0.003
  fsl += tax
  floor_price = fsl/supply
  market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)
  invested += market_price
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
    multiplier = ratio/32              
    transfer = psl*multiplier
    psl -= transfer
    fsl += transfer
    target = target*1.02
    floor_price = fsl/supply
    market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)  
    #print("Floor raise! Ratio:", psl/fsl)
  return 'raise'
    
#tracks random pattern of redemptions, buys and sells (with decimals)

buy(652.3)
floor_raise()
redeem(71.9)
floor_raise()
buy(32)
floor_raise()
redeem(298)
floor_raise()
buy(53)
floor_raise()
sell(31.7)
buy(286)
floor_raise()
sell(65.1)
redeem(32)
floor_raise()
buy(4.7)
floor_raise()
buy(123)
floor_raise()

market_price *= (10 ** 18)
enc = encode(['uint256'], [int(market_price)])
print("0x" + enc.hex())