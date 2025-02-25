import { Table } from "@chevtek/poker-engine";
import { FixedPlayer } from "./FixedPlayer";

export class FixedTable extends Table {
  static Player = FixedPlayer;
  Player = FixedPlayer;

  constructor(buyIn: number, smallBlind: number, bigBlind: number) {
    super(buyIn, smallBlind, bigBlind);
  }
}