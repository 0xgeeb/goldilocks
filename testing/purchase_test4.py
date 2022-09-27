import random

struct = {
  "fsl": 75,
  "supply": 110,
  "psl": 25,
  "target": 0.4
}

floor_price = struct["fsl"] / struct["supply"]
market_price = floor_price + ((struct["psl"] / struct["supply"]) * ((struct["psl"] + struct["fsl"]) / struct["fsl"]))
ratio = struct["psl"] / struct["fsl"]

print(market_price)

def buy(amount):
  global floor_price
  global market_price
  global ratio
  purchase_price = 0
  for i in range(0, amount):
    purchase_price += market_price
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
    market_price = floor_price + ((struct["psl"] / struct["supply"]))*((struct["psl"] + struct["fsl"]) / struct["fsl"])
    print("market price:", market_price, " | ", "floor price:", floor_price)
  print(purchase_price)
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
      market_price = floor_price + ((struct["psl"] / max(struct["supply"], 1)) * ((struct["psl"] + struct["fsl"]) / max(struct["fsl"], 1)))
      tax = market_price*0.05
      struct["fsl"] += tax
      floor_price = struct["fsl"] / max(struct["supply"], 1)
      print("market price:", market_price, " | ", "floor price:", floor_price)
  # return market_price

buy(10)