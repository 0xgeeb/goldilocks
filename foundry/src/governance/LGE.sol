//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


// |============================================================================================|
// |    ______      _____    __      _____    __   __       _____     _____   __  __   ______   |
// |   /_/\___\    ) ___ (  /\_\    /\ __/\  /\_\ /\_\     ) ___ (   /\ __/\ /\_\\  /\/ ____/\  |
// |   ) ) ___/   / /\_/\ \( ( (    ) )  \ \ \/_/( ( (    / /\_/\ \  ) )__\/( ( (/ / /) ) __\/  |
// |  /_/ /  ___ / /_/ (_\ \\ \_\  / / /\ \ \ /\_\\ \_\  / /_/ (_\ \/ / /    \ \_ / /  \ \ \    |
// |  \ \ \_/\__\\ \ )_/ / // / /__\ \ \/ / // / // / /__\ \ )_/ / /\ \ \_   / /  \ \  _\ \ \   |
// |   )_)  \/ _/ \ \/_\/ /( (_____() )__/ /( (_(( (_____(\ \/_\/ /  ) )__/\( (_(\ \ \)____) )  |
// |   \_\____/    )_____(  \/_____/\/___\/  \/_/ \/_____/ )_____(   \/___\/ \/_//__\/\____\/   |
// |                                                                                            |
// |============================================================================================|
// ==============================================================================================
// ============================================ LGE =============================================
// ==============================================================================================


import { SafeTransferLib } from "../../lib/solady/src/utils/SafeTransferLib.sol";
import { FixedPointMathLib } from "../../lib/solady/src/utils/FixedPointMathLib.sol";
import { MerkleProofLib } from "../../lib/solady/src/utils/MerkleProofLib.sol";
import { IGAMM } from "../../src/interfaces/IGAMM.sol";


/// @title LGE
/// @notice Liquidity Generation Event for $LOCKS token
/// @author geeb
/// @author ampnoob
contract LGE {


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      STATE VARIABLES                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/



  bytes32 public root;
  uint256 public totalContribution;
  uint256 public startTime;
  uint256 public hardCap = 500000e18;
  uint256 public maxContribution = 20000e18;
  uint256 public locksPresaleSupply = 7000e18;

  address public honey;
  address public gamm;
  address public multisig; 

  bool claimPeriod = false;
    
  mapping(address => uint256) public contributions;
    

  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                          CONSTRUCTOR                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
    

  /// @notice Constructor of this contract
  /// @param _honey Address of $HONEY
  /// @param _gamm Address of $LOCKS
  /// @param _multisig Address of the GoldilocksDAO multisig
  constructor(address _honey, address _gamm, address _multisig) {
    startTime = block.timestamp;
    honey = _honey;
    gamm = _gamm;
    multisig = _multisig;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           ERRORS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  error NotWhitelisted();
  error NotMultisig();
  error NotClaimPeriod();
  error HardcapHit();
  error PresaleOver();
  error ExcessiveContribution();
  error NoContribution();


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         MODIFIERS                          */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

  
  /// @notice Ensures only whitelisted addresses contribute in first 6 hours of presale
  modifier onlyEarlyWhitelist(bytes32[] memory proof) {
    if(block.timestamp - startTime < 6 hours) {
      if(!MerkleProofLib.verify(proof, root, keccak256(abi.encodePacked(msg.sender)))) revert NotWhitelisted();
    }
    _;
  }

  /// @notice Ensures msg.sender is GoldilocksDAO multisig
  modifier onlyMultisig() {
    if(msg.sender != multisig) revert NotMultisig();
    _;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      EXTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Contributes $HONEY to the $LOCKS presale
  /// @param amount Amount of $HONEY to contribute to presale
  /// @param proof MerkleProof of whitelist admission
  function contribute(uint256 amount, bytes32[] memory proof) external onlyEarlyWhitelist(proof) {
    if(totalContribution + amount > hardCap) revert HardcapHit();
    if(block.timestamp - startTime > 24 hours) revert PresaleOver();
    if(contributions[msg.sender] + amount > maxContribution) revert ExcessiveContribution();
    contributions[msg.sender] += amount;
    totalContribution += amount;
    SafeTransferLib.safeTransferFrom(honey, msg.sender, address(this), amount);
  }

  /// @notice Claims $LOCKS based on presale contribution
  /// @dev share = (contribution / total contribution) * 7000
  function claim() external {
    if(!claimPeriod) revert NotClaimPeriod();
    uint256 contribution = contributions[msg.sender];
    if(contribution == 0) revert NoContribution();
    uint256 share = FixedPointMathLib.divWad(contribution, totalContribution);
    share = FixedPointMathLib.mulWad(share, locksPresaleSupply);
    contributions[msg.sender] -= contribution;
    SafeTransferLib.safeTransfer(gamm, msg.sender, share);
  }

  /// @notice Initiates the claim period of the presale
  function initiate() external onlyMultisig {
    if(block.timestamp - startTime < 24 hours) revert NotClaimPeriod();
    claimPeriod = true;
    (
      uint256 fslLiq,
      uint256 pslLiq,
      uint256 treasuryLiq
    ) = calculateContributionDistribution();
    IGAMM(gamm).initiatePresaleClaim(fslLiq, pslLiq);
    SafeTransferLib.safeTransfer(honey, gamm, fslLiq + pslLiq);
    SafeTransferLib.safeTransfer(honey, multisig, treasuryLiq);
    SafeTransferLib.safeTransfer(gamm, multisig, 3000e18);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                     INTERNAL FUNCTION                      */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  function calculateContributionDistribution() internal view returns (
    uint256 fslLiq,
    uint256 pslLiq, 
    uint256 treasuryLiq
  ) {
    uint256 _totalContribution = totalContribution;
    fslLiq = (_totalContribution / 100) * 75;
    pslLiq = (_totalContribution / 100) * 15;
    treasuryLiq = (_totalContribution / 100) * 10;
  }

}