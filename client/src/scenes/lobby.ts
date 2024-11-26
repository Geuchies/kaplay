import { k } from "../App";
import { Room } from "colyseus.js";
import type { RoomState, Player } from "../../../server/src/rooms/schema/RoomState";
import { colyseusSDK } from "../core/colyseus";


export function createLobbyScene() {
  k.scene("lobby", (room: Room<RoomState>) => {
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

      // If this is the current player's sprite, move the camera
      if (sessionId === room.sessionId) {
        k.onUpdate(() => {
          // Smoothly adjust the camera to follow the player
          k.camPos(
            k.vec2(
              k.lerp(k.camPos().x, sprite.pos.x, 12 * k.dt()),
              k.lerp(k.camPos().y, sprite.pos.y, 12 * k.dt())
            )
          );

          // Update the coordinate text
          coordinateText.text = `Position: (x: ${Math.round(sprite.pos.x)}, y: ${Math.round(sprite.pos.y)})`;

          // Check if the player reaches a specific coordinate
          if (sprite.pos.x > 500 && sprite.pos.y > 300) {
            // Disable updates to avoid multiple triggers
            k.onUpdate(() => { });

            // Leave the current room safely
            room.leave().then(() => {
              console.log("Left room successfully, now joining the new room.");
              joinNewRoom();
            }).catch((err) => {
              console.error("Error leaving the room:", err);
            });
          }
        });
      }
    });

    // Listen when a player is removed from server state
    room.state.players.onRemove((player, sessionId) => {
      k.destroy(spritesBySessionId[sessionId]);
    });

    // Key input to send movement commands to the server
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

function createPlayer(player: Player, room: Room<RoomState>) {
  k.loadSprite(player.avatar, `assets/${player.avatar}.png`);

  // Add player sprite
  const sprite = k.add([
    k.sprite(player.avatar),
    k.pos(player.x, player.y),
    k.anchor("center"),
    k.scale(0.5),
  ]);

  // Update the sprite position based on server state
  sprite.onUpdate(() => {
    sprite.pos.x += (player.x - sprite.pos.x) * 12 * k.dt();
    sprite.pos.y += (player.y - sprite.pos.y) * 12 * k.dt();
  });

  return sprite;
}


async function joinNewRoom() {
  console.log(111111)
  try {
    const newRoom = await colyseusSDK.joinOrCreate<RoomState>("my_room2", {
      name: "Ka2"
    });

    console.log("Joined new room:", newRoom);

    // Load the new room's scene
    k.go("lobby", newRoom);
  } catch (err) {
    console.error("Error joining new room:", err);
  }
}
