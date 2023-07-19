from eth_abi import encode_single

fsl = 1400000
supply = 5000
psl = 400000
floor_price = fsl/supply
market_price = floor_price + ((psl/supply)*((psl+fsl)/fsl)**5)

market_price *= (10 ** 18)
enc = encode_single('uint256', int(market_price))
print("0x" + enc.hex())