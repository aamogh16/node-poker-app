import { createRequire } from "module";
import { Card, Table } from "../src";
const require = createRequire(import.meta.url);
const pokersolver = require("pokersolver");
const { Hand } = pokersolver;

export class Player {
  private _stackSize: number = 0;
  bet: number = 0;
  raise?: number;
  holeCards?: [Card, Card];
  folded: boolean = false;
  showCards: boolean = false;
  left: boolean = false;
  private _lastAction?: string;

  constructor(public id: string, stackSize: number, public table: Table) {
    this.stackSize = stackSize; // This will use the setter
  }

  get stackSize(): number {
    return this._stackSize;
  }

  set stackSize(value: number) {
    this._stackSize = Number(value.toFixed(2));
  }

  get lastAction(): string | undefined {
    return this._lastAction;
  }

  set lastAction(value: string | undefined) {
    this._lastAction = value;
  }

  get hand() {
    if (!this.holeCards) return null;
    return Hand.solve(
      this.holeCards
        .concat(this.table.communityCards)
        .map((card) => `${card.rank}${card.suit}`)
    );
  }

  betAction(amount: number) {
    if (this !== this.table.currentActor) {
      throw new Error("Action invoked on player out of turn!");
    }
    if (!this.legalActions().includes("bet")) {
      throw new Error("Illegal action.");
    }
    if (isNaN(amount)) {
      throw new Error("Amount was not a valid number.");
    }
    const currentBet = this.table.currentBet;
    if (currentBet)
      throw new Error("Illegal action. There is already a bet on the table.");
    if (amount < this.table.bigBlind) {
      throw new Error("A bet must be at least as much as the big blind.");
    } else if (amount > this.stackSize) {
      throw new Error("You cannot bet more than you brought to the table.");
    }
    this.raiseAction(amount);
  }

  callAction() {
    if (this !== this.table.currentActor) {
      throw new Error("Action invoked on player out of turn!");
    }
    if (!this.legalActions().includes("call")) {
      throw new Error("Illegal action.");
    }
    const currentBet = this.table.currentBet;
    if (!currentBet)
      throw new Error("Illegal action. There is no bet to call.");
    const callAmount = currentBet - this.bet;
    // All-in via inability to call
    if (callAmount > this.stackSize) {
      // Add stack to current bet and empty stack;
      this.bet += this.stackSize;
      this.stackSize = 0;
    } else {
      delete this.raise;
      this.stackSize -= callAmount;
      this.bet += callAmount;
    }
    this.table.nextAction();
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
      throw new Error("You cannot bet more than you brought to the table.");
    }

    const currentBet = this.table.currentBet;
    const lastRaise = this.table.lastRaise;
    const minRaise = lastRaise ?? this.table.bigBlind;
    const raiseAmount = currentBet ? amount - currentBet : amount;

    if (raiseAmount < minRaise && amount < this.stackSize + this.bet) {
      throw new Error(
        `You must raise by at least \`$${minRaise}\`, making the bet \`$${minRaise + (currentBet ?? 0)
        }\`.`
      );
    }

    // Correct raise calculation
    const newTotalBet = amount; // The total amount the player wants to be at
    const additionalBet = newTotalBet - this.bet; // Difference from current bet

    if (additionalBet > this.stackSize) {
      throw new Error("You cannot bet more than your stack.");
    }

    this.stackSize -= additionalBet;
    this.bet = newTotalBet;
    this.table.currentBet = Math.max(this.table.currentBet ?? 0, this.bet);

    // Update last raise amount if it's a valid raise
    if (raiseAmount >= minRaise) {
      this.raise = this.table.lastRaise = raiseAmount;
    }

    // Update last position correctly
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

    this.table.nextAction();
  }

  checkAction() {
    if (this !== this.table.currentActor) {
      throw new Error("Action invoked on player out of turn!");
    }
    if (!this.legalActions().includes("check")) {
      throw new Error("Illegal action.");
    }
    this.table.nextAction();
  }

  foldAction() {
    if (this !== this.table.currentActor) {
      throw new Error("Action invoked on player out of turn!");
    }
    if (!this.legalActions().includes("fold")) {
      throw new Error("Illegal action.");
    }
    this.folded = true;
    this.table.nextAction();
  }

  legalActions() {
    const currentBet = this.table.currentBet;
    const lastRaise = this.table.lastRaise;
    const actions: string[] = [];
    if (!currentBet) {
      actions.push("check", "bet");
    } else {
      if (this.bet === currentBet) {
        actions.push("check");
        if (
          this.stackSize > currentBet &&
          this.table.actingPlayers.length > 0
        ) {
          actions.push("raise");
        }
      }
      if (this.bet < currentBet) {
        actions.push("call");
        if (
          this.stackSize > currentBet &&
          this.table.actingPlayers.length > 0 &&
          (!lastRaise || lastRaise <= this.stackSize)
        ) {
          actions.push("raise");
        }
      }
    }
    actions.push("fold");
    return actions;
  }
}
