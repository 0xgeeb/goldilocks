fsl = 1600000
supply = 1000
psl = 400000
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)

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
    # if psl/fsl >= 0.36: all deposited capital goes to fsl
    if psl/fsl >= 0.5:
      fsl += market_price
      floor_price = fsl/supply
    else:
      fsl += floor_price
      psl += (market_price - floor_price)
    market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)  
    invested += market_price
  tax = purchase_price*0.003
  fsl += tax
  invested += tax
  floor_price = fsl/supply
  market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)
  return market_price

print('market: ', market_price, ' | ', 'floor: ', floor_price)

print()