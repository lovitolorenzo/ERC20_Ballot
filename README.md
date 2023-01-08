# Lesson 12 - Tokenized Votes

## Purpose

- The project is actually a Tokenized Ballot, where tokens are used by voters to indeed submit their vote.
- It works with ERC20Votes.sol contract where tokens are generated, making use of **_@openzeppelin library_**.
- TokenizedBallot.sol, instead, is the actual Ballot's contract where the logic behind the voting takes shape.
- In scripts folder we have all the contracts' deployment, the tokens' generation process, and shows a basic example of ballot.

## The ERC20Votes ERC20 extension

- ERC20Votes properties
- Snapshots
- Creating snapshots when supply changes
- Using snapshots
- Self delegation
- Contract overall operation

### References

https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Votes

https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Snapshot

https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Permit

<pre><code>// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyToken is ERC20, AccessControl, ERC20Permit, ERC20Votes {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("MyToken", "MTK") ERC20Permit("MyToken") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}</code></pre>

## ERC20Votes and Ballot.sol

- (Review) TDD
- Mapping scenarios
- Contracts structure
