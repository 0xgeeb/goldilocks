export const useGammMath = () => {

  const floorPrice = (fsl: number, supply: number): number => {
    return fsl / supply
  }
  
  const marketPrice = (fsl: number, psl: number, supply: number): number => {
    return floorPrice(fsl, supply) + ((psl / supply) * ((psl + fsl) / fsl)**5)
  }

  const simulateBuyDry = (locks: number, fsl: number, psl: number, supply: number): number => {
    let _leftover = locks
    let _fsl = fsl
    let _psl = psl
    let _supply = supply
    let _purchasePrice = 0
    let _tax = 0
    let _market = 0
    let _floor = 0
    while(_leftover >= 1) {
      _market = marketPrice(_fsl, _psl, _supply)
      _floor = floorPrice(_fsl, _supply)
      _purchasePrice += _market
      _supply++
      if(_psl / _fsl >= 0.50) {
        _fsl += _market
      }
      else {
        _fsl += _floor
        _psl += (_market - _floor)
      }
      _leftover--
    }
    if(_leftover > 0) {
      _market = marketPrice(_fsl, _psl, _supply)
      _floor = floorPrice(_fsl, _supply)
      _purchasePrice += _market * _leftover
      _supply += _leftover
      if(_psl / _fsl >= 0.50) {
        _fsl += _market * _leftover
      }
      else {
        _psl += (_market - _floor) * _leftover
        _fsl += _floor * _leftover
      }
    }
    _tax = _purchasePrice * 0.003
    return _purchasePrice + _tax
  }

  const simulateSellDry = (locks: number, fsl: number, psl: number, supply: number): number => {
    let _leftover = locks
    let _fsl = fsl
    let _psl = psl
    let _supply = supply
    let _salePrice = 0
    let _tax = 0
    let _market = 0
    let _floor = 0
    while(_leftover >= 1) {
      _market = marketPrice(_fsl, _psl, _supply)
      _floor = floorPrice(_fsl, _supply) 
      _salePrice += _market
      _supply--
      _leftover--
      _fsl -= _floor
      _psl -= (_market - _floor)
    }
    if(_leftover > 0) {
      _market = marketPrice(_fsl, _psl, _supply)
      _floor = floorPrice(_fsl, _supply)
      _salePrice += _market * _leftover
      _psl -= (_market - _floor) * _leftover
      _fsl -= _floor * _leftover
      _supply -= _leftover
    }
    _tax = _salePrice * 0.053
    return _salePrice - _tax
  }

  return { floorPrice, marketPrice, simulateBuyDry, simulateSellDry }
}