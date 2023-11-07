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
// ===================================== GoldiGovernor ==========================================
// ==============================================================================================


import { Governor } from "../../lib/openzeppelin-contracts/contracts/governance/Governor.sol";
import { TimelockController } from "../../lib/openzeppelin-contracts/contracts/governance/TimelockController.sol";
import { IVotes } from "../../lib/openzeppelin-contracts/contracts/governance/utils/IVotes.sol";
import { GovernorSettings } from "../../lib/openzeppelin-contracts/contracts/governance/extensions/GovernorSettings.sol";
import { GovernorCountingSimple } from "../../lib/openzeppelin-contracts/contracts/governance/extensions/GovernorCountingSimple.sol";
import { GovernorVotes } from "../../lib/openzeppelin-contracts/contracts/governance/extensions/GovernorVotes.sol";
import { GovernorVotesQuorumFraction } from "../../lib/openzeppelin-contracts/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import { GovernorTimelockControl } from "../../lib/openzeppelin-contracts/contracts/governance/extensions/GovernorTimelockControl.sol";

contract GoldiGovernor is Governor, GovernorSettings, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl {
  constructor(IVotes _token, TimelockController _timelock)
    Governor("GoldiGovernor")
    GovernorSettings(7200 /* 1 day */, 50400 /* 1 week */, 0)
    GovernorVotes(_token)
    GovernorVotesQuorumFraction(51)
    GovernorTimelockControl(_timelock)
  {}

  // The following functions are overrides required by Solidity.

  function votingDelay()
    public
    view
    override(Governor, GovernorSettings)
    returns (uint256)
  {
    return super.votingDelay();
  }

  function votingPeriod()
    public
    view
    override(Governor, GovernorSettings)
    returns (uint256)
  {
    return super.votingPeriod();
  }

  function quorum(uint256 blockNumber)
    public
    view
    override(Governor, GovernorVotesQuorumFraction)
    returns (uint256)
  {
    return super.quorum(blockNumber);
  }

  function state(uint256 proposalId)
    public
    view
    override(Governor, GovernorTimelockControl)
    returns (ProposalState)
  {
    return super.state(proposalId);
  }

  function proposalNeedsQueuing(uint256 proposalId)
    public
    view
    override(Governor, GovernorTimelockControl)
    returns (bool)
  {
    return super.proposalNeedsQueuing(proposalId);
  }

  function proposalThreshold()
    public
    view
    override(Governor, GovernorSettings)
    returns (uint256)
  {
    return super.proposalThreshold();
  }

  function _queueOperations(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
    internal
    override(Governor, GovernorTimelockControl)
    returns (uint48)
  {
    return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
  }

  function _executeOperations(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
      internal
    override(Governor, GovernorTimelockControl)
  {
    super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
  }

  function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
    internal
    override(Governor, GovernorTimelockControl)
    returns (uint256)
  {
    return super._cancel(targets, values, calldatas, descriptionHash);
  }

  function _executor()
    internal
    view
    override(Governor, GovernorTimelockControl)
    returns (address)
  {
    return super._executor();
  }
}