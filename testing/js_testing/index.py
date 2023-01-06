fsl = 286.064
psl = 18.65
supply = 3
target = 0.26

def buy(amount):
  global supply
  global fsl
  global psl
  purchase_price = 0
  tax = 0
  for i in range(0, amount):
    purchase_price += market_price(fsl, psl, supply)
    supply += 1
    if psl/fsl >= 0.50:
      fsl += market_price
    else:
      fsl += floor_price(fsl, supply)
      psl += (market_price(fsl, psl, supply) - floor_price(fsl, supply))
  tax = purchase_price*0.003
  fsl += tax
  return purchase_price - tax

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
    market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
  return 'raise'

def floor_price(_fsl, _supply):
  return _fsl / _supply

def market_price(_fsl, _psl, _supply):
  return floor_price(_fsl, _supply) + ((_psl / _supply) * ((_psl + _fsl) / _fsl)**5)

# bought = 0
# while(bought < 400):
#   buy(10)
#   floor_raise()
#   bought += 10
  # print("market price:", market_price, "floor price:", floor_price)


print("cost ", buy(1))
print("market ", market_price(fsl, psl, supply))
print("floor ", floor_price(fsl, supply))
print("fsl ", fsl)
print("psl ", psl)
print("supply ", supply)