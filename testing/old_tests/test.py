fsl = 1600000
psl = 400000
supply = 1000

market_price = (fsl / supply) + ((psl / supply) * ((psl + fsl) / fsl)**5)
print(market_price)