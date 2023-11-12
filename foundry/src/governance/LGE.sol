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
import { MerkleProofLib } from "../../lib/solady/src/utils/MerkleProofLib.sol";


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

  address public honey;
  address public multisig; 

  bool public presaleOver = false;
    
  mapping(address => uint256) public contributions;
    
  //allocations
  mapping(address => uint256) allocations; 
  //bool tracking if treasury funds have been dispersed
  bool dispersed = false;
  //list of contributing addresses
  address[] contributors;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                          CONSTRUCTOR                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
    

  /// is it possible to mint the teams' LOCKS allowance in here? If possible, would like to mint team tokens as soon as presale contract is initiated
  /// @notice Constructor of this contract
  constructor() {
    startTime = block.timestamp;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           ERRORS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  error NotWhitelisted();
  error NotMultisig();
  error HardcapHit();
  error PresaleOver();
  error ExcessiveContribution();


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

  /// @notice Ensures msg.sender is Goldilocks DAO multisig
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

  //function to be called at conclusion of presale that mints LOCKS to contributors and sends 90% of funds to liquidity
  function conclude () public {
    // //check the function hasn't already been called
    // require(concluded == false, "presale already concluded");
    // //check presale has ended
    // require(block.timestamp - startTime >= 24 hours || totalContribution == hardCap, "presale still ongoing");
    // //loop through contributing addresses
    // for (uint256 i = 0; i < contributors.length; ++i ) {
    //   //calculate each contributor's share of the total contribution 
    //   uint256 _share = contributors[i]*10**18/totalContribution;
    //   //mint the contributor a proportional share of the 6000 tokens avilable in the public sale
    //   locks.mint(contributors[i], _share*6000);
    // }
    // //once all tokens have been minted, send funds to liquidity (75% to fsl 15% to psl)
    // fsl += (totalContribution * 75)/100;
    // psl += (totalContribution * 15)/100;
    // //update concluded status
    // concluded = true;
  }

  function fundGAMM() external onlyMultisig {
    
  }

  //function to send 10% of raised funds to a designated treasury wallet (to be called after a vote by token holders)
  function disperseTreasuryFunds (address _wallet) public {
    // //check user is the multisig
    // require (msg.sender == multisig, "only treasury wallet can call this funciton");
    // //check presale has concluded
    // require (concluded == true, "presale not yet concluded");
    // //check treasury funds haven't been dispersed
    // require (dispersed == false, "treasury funds already dispersed");
    // //transfer the funds to the designated wallet
    // HONEY.transferFrom(address(this), _wallet, totalContribution*10/100);
    // //update dispersed variable
    // dispersed = true;
  }





}