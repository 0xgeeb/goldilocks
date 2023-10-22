from eth_abi import encode

fsl = 1400000
supply = 5000
psl = 400000
floor_price = fsl/supply

floor_price *= (10 ** 18)
enc = encode(['uint256'], [int(floor_price)])
print("0x" + enc.hex())