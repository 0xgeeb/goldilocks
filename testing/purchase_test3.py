import random

struct = {
  "fsl": 75,
  "supply": 110,
  "psl": 25,
  "exponent": 2.7,
  "target": 0.5
}

floor_price = struct["fsl"] / struct["supply"]
market_price = floor_price + ((struct["psl"] / struct["supply"]) * ((struct["psl"] + struct["fsl"]) / struct["fsl"])**struct["exponent"])
ratio = struct["psl"] / struct["fsl"]

# print(market_price)

def buy(amount):
  global floor_price
  global market_price
  global ratio
  for i in range(0, amount):
    struct["supply"] += 1
    struct["fsl"] += floor_price
    struct["psl"] += (market_price - floor_price)
    if struct["psl"] / struct["fsl"] >= struct["target"]:
      transfer = struct["psl"] * 0.05
      struct["psl"] -= transfer
      struct["fsl"] += transfer
      floor_price = struct["fsl"] / struct["supply"]
      struct["target"] = struct["target"] * 1.1
      print("floor raise!")
    market_price = floor_price + ((struct["psl"] / max(struct["supply"], 1))*((struct["psl"] + struct["fsl"]) / max(struct["fsl"], 1)) * struct["exponent"])
    print("market price:", round(market_price, 5), " | ", "floor price:", round(floor_price, 5))
  return market_price

def sell(amount):
  global floor_price
  global market_price
  global ratio
  for i in range(0, amount):
    if struct["supply"] >= 0:
      struct["supply"] -= 1
      struct["fsl"] -= floor_price
      struct["psl"] -= (market_price - floor_price)
      market_price = floor_price + ((struct["psl"] / max(struct["supply"], 1)) * ((struct["psl"] + struct["fsl"]) / max(struct["fsl"], 1)) * struct["exponent"])
      tax = market_price*0.05
      struct["fsl"] += tax
      floor_price = struct["fsl"] / max(struct["supply"], 1)
      print("market price:", round(market_price, 5), " | ", "floor price:", round(floor_price, 5))
  return market_price

# buy(130)
# sell(130)

for i in range(0, 150):
  rando = random.random()
  if(rando < 0.25):
    if(rando < 0.125):
      buy(5)
    else:
      buy(10)
  elif(rando < 0.5):
    if(rando < 0.375):
      sell(5)
    else:
      sell(10)
  elif(rando < 0.75):
    if(rando < 0.625):
      buy(5)
    else:
      buy(10)
  else:
    if(rando < 0.875):
      sell(5)
    else:
      sell(10)