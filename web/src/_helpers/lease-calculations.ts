import { Deployment } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/deployment';
import { Account } from '@akashnetwork/akashjs/build/protobuf/akash/escrow/v1beta2/types';
import { Lease } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/lease';
import { DecCoin } from '@akashnetwork/akashjs/build/protobuf/cosmos/base/v1beta1/coin';

import add from 'date-fns/add';
import _d from 'datedash';

export const averageDaysInMonth = 30.437;
export const averageBlockTimeInSeconds = 6.098;

export function uaktToAKT(amount: number, precision = 3) {
  return (
    Math.round((amount / 1000000 + Number.EPSILON) * Math.pow(10, precision)) /
    Math.pow(10, precision)
  );
}

export function aktToUakt(amount: number) {
  return Math.round(amount * 1000000);
}

export function decCoinToNum(coin: DecCoin) {
  return parseInt(coin.amount);
}

export function ceilDecimal(value: number) {
  return Math.ceil((value + Number.EPSILON) * 100) / 100;
}

export function getAvgAktCostPerMonth(leasePriceAmount: number) {
  const price = uaktToAKT(leasePriceAmount, 6);
  const averagePrice = price * (60 / averageBlockTimeInSeconds) * 60 * 24 * averageDaysInMonth;

  const _value = parseFloat(averagePrice.toString());
  const computedValue = _value > 0 ? ceilDecimal(_value) : 0;
  return computedValue;
}

export function getTimeLeft(leasePriceAmount: number, balance: number) {
  const blocksLeft = balance / leasePriceAmount;
  const timestamp = new Date().getTime();
  const calculate = add(new Date(timestamp), { seconds: blocksLeft * averageBlockTimeInSeconds });
  const today: any = new Date(_d.date(new Date(), '/'));
  const endDate: any = new Date(_d.date(calculate, '/'));
  const difference = Math.abs(endDate - today);
  return `${(difference / (1000 * 3600 * 24)).toFixed(0)} days`;
}

export function leaseCalculator(
  deployment: Deployment | undefined,
  escrowAccount: Required<Account> | undefined,
  lease: Lease | undefined,
  aktCurrentPrice: number
) {
  if (!deployment || !lease || !escrowAccount) return;

  const leasePriceAmount = lease.price ? decCoinToNum(lease.price) : 0;
  const escrowBalanceAmount = escrowAccount.balance ? decCoinToNum(escrowAccount.balance) : 0;
  const escrowTransferredAmount = escrowAccount.transferred
    ? decCoinToNum(escrowAccount.transferred)
    : 0;

  // data returned
  const costAkt = getAvgAktCostPerMonth(leasePriceAmount);
  const costUsd = costAkt * aktCurrentPrice;
  const balanceAkt = uaktToAKT(escrowBalanceAmount);
  const balanceUsd = balanceAkt * aktCurrentPrice;
  const spentAkt = uaktToAKT(escrowTransferredAmount);
  const spentUsd = spentAkt * aktCurrentPrice;
  const timeLeft = getTimeLeft(leasePriceAmount, escrowBalanceAmount);

  return {
    costAkt,
    costUsd,
    balanceAkt,
    balanceUsd,
    spentAkt,
    spentUsd,
    timeLeft,
  };
}
