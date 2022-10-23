fsl = 800000
psl = 200000
supply = 1000000

# return _floorPrice(_fsl, _supply) + (((_psl*(10**18) / _supply) * (((_psl + _fsl)*(10**18)) / _fsl))/(10**18));

market_price = (fsl / supply) + ((psl / supply) * ((psl + fsl) / fsl))
market_priceE = (fsl / supply) + (((psl / supply) * ((psl + fsl) / fsl))**4)

print(market_price)
print(market_priceE)