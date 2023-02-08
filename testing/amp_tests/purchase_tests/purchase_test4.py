import random
from eth_abi import encode_single
#this test varies the initial psl, fsl and supply
fsl = 8700000
supply = 2364
psl = 1900000
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
  if psl/fsl >= 0.36:
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
    
#tracks what happens when 8000 tokens are bought continuously in chunks of 40 with no sells
bought = 0
while(bought < 8000):
  buy(40)
  floor_raise()
  bought += 40
  # print("Price:", market_price, "Floor price:", floor_price)

market_price *= (10 ** 18)
enc = encode_single('uint256', int(market_price))
print("0x" + enc.hex())