from eth_abi import encode_single

fsl = 23457745
supply = 4374
psl = 8340957
floor_price = fsl/supply

floor_price *= (10 ** 18)
enc = encode_single('uint256', int(floor_price))
print("0x" + enc.hex())