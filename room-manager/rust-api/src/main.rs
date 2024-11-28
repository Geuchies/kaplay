use actix_web::{web, App, HttpServer, Responder};
use serde::Deserialize;
mod utils;

use utils::room::{generate_rooms, preload_edges, Coordinate};

#[derive(Deserialize)]
struct RoomRequest {
    x: i32,
    y: i32,
}

async fn get_rooms(req: web::Json<RoomRequest>) -> impl Responder {
    let center = Coordinate { x: req.x, y: req.y };
    let rooms = generate_rooms(&center);
    let edges = preload_edges(&center);

    web::Json(serde_json::json!({
        "center": center,
        "rooms": rooms,
        "preloadEdges": edges,
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/rooms", web::post().to(get_rooms))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
