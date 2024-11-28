use serde::Serialize;

#[derive(Serialize)]
pub struct Coordinate {
    pub x: i32,
    pub y: i32,
}

#[derive(Serialize)]
pub struct Room {
    pub id: String,
    pub center: Coordinate,
}

/// Generate surrounding rooms for a given coordinate
pub fn generate_rooms(center: &Coordinate) -> Vec<Room> {
    let mut rooms = Vec::new();

    for dx in -1..=1 {
        for dy in -1..=1 {
            let room_center = Coordinate {
                x: center.x + dx,
                y: center.y + dy,
            };
            let room_id = format!("room_{}_{}", room_center.x, room_center.y);
            rooms.push(Room {
                id: room_id,
                center: room_center,
            });
        }
    }

    rooms
}

/// Preload edges for player transition
pub fn preload_edges(center: &Coordinate) -> Vec<Room> {
    let offsets = [
        Coordinate { x: -2, y: 0 },
        Coordinate { x: 2, y: 0 },
        Coordinate { x: 0, y: -2 },
        Coordinate { x: 0, y: 2 },
    ];

    offsets
        .iter()
        .map(|offset| {
            let edge_center = Coordinate {
                x: center.x + offset.x,
                y: center.y + offset.y,
            };
            let room_id = format!("room_{}_{}", edge_center.x, edge_center.y);
            Room {
                id: room_id,
                center: edge_center,
            }
        })
        .collect()
}
