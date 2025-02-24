import { Player, Table } from "@chevtek/poker-engine";

export class FixedPlayer extends Player {
  constructor(id: string, stackSize: number, table: Table) {
    super(id, stackSize, table);
  }

  raiseAction(amount: number) {
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
      // Fixed: Check against total available
      throw new Error("You cannot bet more than you brought to the table.");
    }

    const currentBet = this.table.currentBet;
    const lastRaise = this.table.lastRaise;
    const minRaise = lastRaise ?? this.table.bigBlind;
    const raiseAmount = currentBet ? amount - currentBet : amount;

    // Do not allow the raise if it's less than the minimum and they aren't going all-in.
    if (raiseAmount < minRaise && amount < this.stackSize + this.bet) {
      if (currentBet) {
        throw new Error(
          `You must raise by at least \`$${minRaise}\`, making the bet \`$${
            minRaise + currentBet
          }\`.`
        );
      } else {
        throw new Error(`You must bet at least \`$${minRaise}\`.`);
      }
    } else if (raiseAmount < minRaise && amount >= this.stackSize + this.bet) {
      // When the all-in player is raising for less than the minimum raise
      const remainingStack = this.stackSize;
      this.stackSize = 0;
      this.bet += remainingStack;
      this.table.currentBet = this.bet;
    } else if (amount >= minRaise) {
      const additionalAmount = amount - this.bet; // Fixed: Calculate additional amount needed
      this.stackSize -= additionalAmount; // Fixed: Deduct only the additional amount
      this.bet = amount; // Fixed: Set to final amount
      this.table.currentBet = this.bet;

      // Only mark raise values if there is a current bet.
      if (currentBet) {
        this.raise = this.table.lastRaise = amount - currentBet;
      }

      // Set last action to the player behind this one.
      this.table.lastPosition = this.table.currentPosition! - 1;
      if (this.table.lastPosition === -1)
        this.table.lastPosition = this.table.players.length - 1;
      while (
        !this.table.lastActor ||
        !this.table.actingPlayers.includes(this.table.lastActor)
      ) {
        this.table.lastPosition--;
        if (this.table.lastPosition === -1)
          this.table.lastPosition = this.table.players.length - 1;
      }
    }

    this.table.nextAction();
  }
}
