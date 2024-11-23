import { k } from "../App";
import { Room } from "colyseus.js";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";

export function createLobbyScene() {
  k.scene("lobby", (room: Room<MyRoomState>) => {
    // Keep track of player sprites
    const spritesBySessionId: Record<string, any> = {};

    // Create a text object in the top-left corner
    const coordinateText = k.add([
      k.text("Position: (x: 0, y: 0)", { size: 16 }), // Default text
      k.pos(10, 10), // Top-left corner
      k.fixed(), // Keeps the text in the same position even when the camera moves
    ]);

    // Listen when a player is added on server state
    room.state.players.onAdd((player, sessionId) => {
      const sprite = createPlayer(player, room);
      spritesBySessionId[sessionId] = sprite;

      // Update the coordinate display for the player's own sprite
      if (sessionId === room.sessionId) {
        // Adjust the camera position based on the player's position
        k.onUpdate(() => {
          const targetX = sprite.pos.x;
          const targetY = sprite.pos.y;

          // Smoothly adjust the camera to follow the player
          k.camPos(
            k.vec2(
              k.lerp(k.camPos().x, targetX, 12 * k.dt()),
              k.lerp(k.camPos().y, targetY, 12 * k.dt())
            )
          );

          // Update the coordinate text
          coordinateText.text = `Position: (x: ${Math.round(targetX)}, y: ${Math.round(targetY)})`;
        });
      }
    });

    // Listen when a player is removed from server state
    room.state.players.onRemove((player, sessionId) => {
      k.destroy(spritesBySessionId[sessionId]);
    });

    // Log arrow key press
    k.onKeyDown("left", () => {
      room.send("move-key", { direction: "left" });
    });

    k.onKeyDown("right", () => {
      room.send("move-key", { direction: "right" });
    });

    k.onKeyDown("up", () => {
      room.send("move-key", { direction: "up" });
    });

    k.onKeyDown("down", () => {
      room.send("move-key", { direction: "down" });
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
    k.scale(0.5),
  ]);

  // No need to update sprite position, server updates it

  return sprite;
}
