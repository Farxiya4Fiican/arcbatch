// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BatchPayment is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_RECIPIENTS = 100;

    IERC20 public immutable usdc;

    error InvalidUsdcAddress();
    error EmptyBatch();
    error TooManyRecipients();
    error ArrayLengthMismatch();
    error InvalidRecipient(uint256 index);
    error InvalidAmount(uint256 index);

    event BatchPaymentExecuted(
        address indexed sender,
        uint256 recipientCount,
        uint256 totalAmount
    );

    constructor(address usdcAddress) {
        if (usdcAddress == address(0)) {
            revert InvalidUsdcAddress();
        }

        usdc = IERC20(usdcAddress);
    }

    function batchPay(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant {
        uint256 length = recipients.length;

        if (length == 0) {
            revert EmptyBatch();
        }

        if (length > MAX_RECIPIENTS) {
            revert TooManyRecipients();
        }

        if (length != amounts.length) {
            revert ArrayLengthMismatch();
        }

        uint256 totalAmount = 0;

        for (uint256 i = 0; i < length; ++i) {
            address recipient = recipients[i];
            uint256 amount = amounts[i];

            if (recipient == address(0)) {
                revert InvalidRecipient(i);
            }

            if (amount == 0) {
                revert InvalidAmount(i);
            }

            totalAmount += amount;

            usdc.safeTransferFrom(msg.sender, recipient, amount);
        }

        emit BatchPaymentExecuted(msg.sender, length, totalAmount);
    }
}
