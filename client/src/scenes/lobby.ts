import { k } from "../App";

import { Room } from "colyseus.js";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";

export function createLobbyScene() {
  k.scene("lobby", (room: Room<MyRoomState>) => {

    // keep track of player sprites
    const spritesBySessionId: Record<string, any> = {};

    // listen when a player is added on server state
    room.state.players.onAdd((player, sessionId) => {
      spritesBySessionId[sessionId] = createPlayer(player, room);
    });

    // listen when a player is removed from server state
    room.state.players.onRemove((player, sessionId) => {
      k.destroy(spritesBySessionId[sessionId]);
    });

    k.onClick(() => {
      room.send("move", k.mousePos());
    });

  });
}

function createPlayer(player: Player, room: Room<MyRoomState>) {
  k.loadSprite(player.avatar, `assets/${player.avatar}.png`);

  // Add player sprite
  const sprite = k.add([
    k.sprite(player.avatar),
    k.pos(player.x, player.y),
    k.anchor("center"),
    k.scale(0.5)
  ]);

  sprite.onUpdate(() => {
    sprite.pos.x += (player.x - sprite.pos.x) * 12 * k.dt();
    sprite.pos.y += (player.y - sprite.pos.y) * 12 * k.dt();
  });

  return sprite;
}