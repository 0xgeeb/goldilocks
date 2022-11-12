fsl = 80000000
psl = 20000000
supply = 10000000

market_price = (fsl / supply) + ((psl / supply) * ((psl + fsl) / fsl)**5)
print(market_price)