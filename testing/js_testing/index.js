let fsl = 286.064
let psl = 18.65
let supply = 3
let target = 0.26

function simulateBuy(amount) {
  let _fsl = fsl
  let _psl = psl
  let _supply = supply
  let _purchasePrice = 0
  let _tax = 0
  for(let i = 0; i < amount; i++) {
    _purchasePrice += marketPrice(_fsl, _psl, _supply)
    _supply++
    if (_psl / _fsl >= 0.50) {
      _fsl += marketPrice(_fsl, _psl, _supply)
    }
    else {
      _fsl += floorPrice(_fsl, _supply)
      _psl += marketPrice(_fsl, _psl, _supply) - floorPrice(_fsl, _supply)
    }
  }
  _tax = _purchasePrice * 0.003
  fsl = _fsl + _tax
  psl = _psl
  supply = _supply
  return _purchasePrice - _tax
}

function floorPrice(_fsl, _supply) {
  return _fsl / _supply
}

function marketPrice(_fsl, _psl, _supply) {
  return floorPrice(_fsl, _supply) + ((_psl / _supply) * ((_psl + _fsl) / _fsl)**5)
}

console.log("cost ", simulateBuy(1))
console.log("market ", marketPrice(fsl, psl, supply))
console.log("floor ", floorPrice(fsl, supply))
console.log("fsl ", fsl)
console.log("psl ", psl)
console.log("supply ", supply)