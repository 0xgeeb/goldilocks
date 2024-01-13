def redeem(amount, fsl, psl, supply, floor_price, market_price):  
  supply -=amount
  fsl -= floor_price*amount
  floor_price = fsl/supply
  market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
  return fsl, psl, supply, floor_price, market_price

def sell(amount, fsl, psl, supply, floor_price, market_price):
  sale_price = 0
  while amount >= 1000:
    amount -= 1000
    supply -= 1000
    sale_price += market_price*1000
    fsl -= floor_price*1000
    psl -= (market_price - floor_price)*1000
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
  return fsl, psl, supply, floor_price, market_price

def buy(amount, fsl, psl, supply, floor_price, market_price):
  purchase_price = 0
  while amount >= 1000:
    amount -= 1000
    supply += 1000
    purchase_price += market_price*1000
    if psl/fsl >= 0.5:
      fsl += market_price*1000
      floor_price = fsl/supply
    else:
      fsl += floor_price*1000
      psl += (market_price - floor_price)*1000
    floor_price = fsl/supply
    market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)
  supply += amount
  purchase_price += market_price * amount
  if psl/fsl >= 0.5:
    fsl += market_price * amount
    floor_price = fsl/supply
  else:
    fsl += floor_price * amount
    psl += (market_price - floor_price) * amount
  tax = purchase_price*0.003
  fsl += tax
  floor_price = fsl/supply
  market_price = floor_price + ((psl/max(supply, 1))*((psl+fsl)/max(fsl, 1))**5)
  return fsl, psl, supply, floor_price, market_price

def floor_raise(target, fsl, psl, supply, floor_price, market_price):  
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
  return target, fsl, psl, supply, floor_price, market_price