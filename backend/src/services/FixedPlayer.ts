import { Player, Table } from "@chevtek/poker-engine";

export class FixedPlayer extends Player {
  constructor(id: string, stackSize: number, table: Table) {
    super(id, stackSize, table);
  }

  raiseAction(amount: number) {
    console.log("USING FIXED RAISE LOGIC");
    if (this !== this.table.currentActor) {
      throw new Error("Action invoked on player out of turn!");
    }
    const legalActions = this.legalActions();
    if (!legalActions.includes("raise") && !legalActions.includes("bet")) {
      throw new Error("Illegal action.");
    }
    if (amount === undefined || isNaN(amount)) {
      throw new Error("Amount was not a valid number.");
    }
    if (amount > this.stackSize + this.bet) {
      throw new Error("You cannot bet more than you brought to the table.");
    }

    const currentBet = this.table.currentBet || 0;
    const minRaiseTo =
      currentBet + (this.table.lastRaise ?? this.table.bigBlind);

    // Check if this is an all-in
    const isAllIn = amount >= this.stackSize + this.bet;

    // Don't allow the raise if it's less than the minimum and they aren't going all-in
    if (amount < minRaiseTo && !isAllIn) {
      if (currentBet) {
        throw new Error(`You must raise to at least \`$${minRaiseTo}\`.`);
      } else {
        throw new Error(`You must bet at least \`$${minRaiseTo}\`.`);
      }
    }

    if (isAllIn) {
      // All-in case
      const remainingStack = this.stackSize;
      this.stackSize = 0;
      this.bet += remainingStack;
      this.table.currentBet = this.bet;
    } else {
      // Normal raise case
      const additionalAmount = amount - this.bet;
      this.stackSize -= additionalAmount;
      this.bet = amount;
      this.table.currentBet = this.bet;

      // Only mark raise values if there is a current bet
      if (currentBet) {
        this.raise = this.table.lastRaise = amount - currentBet;
      }
    }

    // Set last action to the player behind this one
    this.table.lastPosition = this.table.currentPosition! - 1;
    if (this.table.lastPosition === -1) {
      this.table.lastPosition = this.table.players.length - 1;
    }
    while (
      !this.table.lastActor ||
      !this.table.actingPlayers.includes(this.table.lastActor)
    ) {
      this.table.lastPosition--;
      if (this.table.lastPosition === -1) {
        this.table.lastPosition = this.table.players.length - 1;
      }
    }

    this.table.nextAction();
  }
}
