// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";

import {BatchPayment} from "../src/BatchPayment.sol";

import {MockUSDC} from "./MockUSDC.sol";

contract BatchPaymentTest is Test {
    BatchPayment internal batchPayment;
    MockUSDC internal usdc;

    address internal sender = address(0xA11CE);
    address internal alice = address(0xB0B);
    address internal bob = address(0xCA11);
    address internal carol = address(0xD00D);

    uint256 internal constant ONE_USDC = 1e6;

    function setUp() public {
        usdc = new MockUSDC();

        batchPayment = new BatchPayment(address(usdc));

        usdc.mint(sender, 100 * ONE_USDC);

        vm.prank(sender);

        usdc.approve(address(batchPayment), type(uint256).max);
    }

    function testBatchPaySuccess() public {
        address[] memory recipients = new address[](3);

        uint256[] memory amounts = new uint256[](3);

        recipients[0] = alice;
        recipients[1] = bob;
        recipients[2] = carol;

        amounts[0] = 5 * ONE_USDC;
        amounts[1] = 7 * ONE_USDC;
        amounts[2] = 3 * ONE_USDC;

        vm.prank(sender);

        batchPayment.batchPay(recipients, amounts);

        assertEq(usdc.balanceOf(alice), 5 * ONE_USDC);

        assertEq(usdc.balanceOf(bob), 7 * ONE_USDC);

        assertEq(usdc.balanceOf(carol), 3 * ONE_USDC);

        assertEq(usdc.balanceOf(sender), 85 * ONE_USDC);
    }

    function testRevertEmptyBatch() public {
        address[] memory recipients = new address[](0);

        uint256[] memory amounts = new uint256[](0);

        vm.prank(sender);

        vm.expectRevert(BatchPayment.EmptyBatch.selector);

        batchPayment.batchPay(recipients, amounts);
    }

    function testRevertArrayLengthMismatch() public {
        address[] memory recipients = new address[](2);

        uint256[] memory amounts = new uint256[](1);

        recipients[0] = alice;
        recipients[1] = bob;

        amounts[0] = ONE_USDC;

        vm.prank(sender);

        vm.expectRevert(BatchPayment.ArrayLengthMismatch.selector);

        batchPayment.batchPay(recipients, amounts);
    }

    function testRevertInvalidRecipient() public {
        address[] memory recipients = new address[](1);

        uint256[] memory amounts = new uint256[](1);

        recipients[0] = address(0);
        amounts[0] = ONE_USDC;

        vm.prank(sender);

        vm.expectRevert(
            abi.encodeWithSelector(BatchPayment.InvalidRecipient.selector, 0)
        );

        batchPayment.batchPay(recipients, amounts);
    }

    function testRevertInvalidAmount() public {
        address[] memory recipients = new address[](1);

        uint256[] memory amounts = new uint256[](1);

        recipients[0] = alice;
        amounts[0] = 0;

        vm.prank(sender);

        vm.expectRevert(
            abi.encodeWithSelector(BatchPayment.InvalidAmount.selector, 0)
        );

        batchPayment.batchPay(recipients, amounts);
    }

    function testRevertTooManyRecipients() public {
        address[] memory recipients = new address[](101);

        uint256[] memory amounts = new uint256[](101);

        for (uint256 i = 0; i < 101; ++i) {
            recipients[i] = address(uint160(i + 1));

            amounts[i] = ONE_USDC;
        }

        vm.prank(sender);

        vm.expectRevert(BatchPayment.TooManyRecipients.selector);

        batchPayment.batchPay(recipients, amounts);
    }

    function testRevertInsufficientAllowance() public {
        address newSender = address(0x1234);

        usdc.mint(newSender, 10 * ONE_USDC);

        address[] memory recipients = new address[](1);

        uint256[] memory amounts = new uint256[](1);

        recipients[0] = alice;

        amounts[0] = 5 * ONE_USDC;

        vm.prank(newSender);

        vm.expectRevert();

        batchPayment.batchPay(recipients, amounts);
    }

    function testAtomicRevert() public {
        address[] memory recipients = new address[](3);

        uint256[] memory amounts = new uint256[](3);

        recipients[0] = alice;
        recipients[1] = bob;
        recipients[2] = carol;

        amounts[0] = 40 * ONE_USDC;

        amounts[1] = 40 * ONE_USDC;

        amounts[2] = 40 * ONE_USDC;

        vm.prank(sender);

        vm.expectRevert();

        batchPayment.batchPay(recipients, amounts);

        assertEq(usdc.balanceOf(alice), 0);

        assertEq(usdc.balanceOf(bob), 0);

        assertEq(usdc.balanceOf(carol), 0);

        assertEq(usdc.balanceOf(sender), 100 * ONE_USDC);
    }

    function testEmitsBatchPaymentExecuted() public {
        address[] memory recipients = new address[](2);

        uint256[] memory amounts = new uint256[](2);

        recipients[0] = alice;
        recipients[1] = bob;

        amounts[0] = 4 * ONE_USDC;
        amounts[1] = 6 * ONE_USDC;

        vm.expectEmit(true, false, false, true);

        emit BatchPayment.BatchPaymentExecuted(sender, 2, 10 * ONE_USDC);

        vm.prank(sender);

        batchPayment.batchPay(recipients, amounts);
    }
    function testBatchPay100Recipients() public {
        address[] memory recipients = new address[](100);

        uint256[] memory amounts = new uint256[](100);

        for (uint256 i = 0; i < 100; ++i) {
            recipients[i] = address(uint160(i + 1000));

            amounts[i] = ONE_USDC;
        }

        vm.prank(sender);

        batchPayment.batchPay(recipients, amounts);

        assertEq(usdc.balanceOf(sender), 0);

        for (uint256 i = 0; i < 100; ++i) {
            assertEq(usdc.balanceOf(recipients[i]), ONE_USDC);
        }
    }
}
