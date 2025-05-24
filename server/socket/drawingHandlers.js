module.exports = function setupDrawingHandlers(socket, io) {
    let currentCanvas = null;
  
    socket.on("join-canvas", (canvasId) => {
      if (currentCanvas) {
        socket.leave(currentCanvas);
      }
      socket.join(canvasId);
      currentCanvas = canvasId;
      console.log(`Socket ${socket.id} joined canvas ${canvasId}`);
    });
  
    socket.on("draw", (data) => {
      if (currentCanvas) {
        socket.to(currentCanvas).emit("draw", data);
      }
    });

    socket.on("draw-segment", (data) => {
      if (currentCanvas) {
        // Send to all others in the same canvas
        socket.to(currentCanvas).emit("draw-segment", data);
      }
    });
  
    socket.on("draw-stroke", (stroke) => {
      if (currentCanvas) {
        socket.to(currentCanvas).emit("draw-stroke", stroke);
      }
    });  
  
    socket.on("clear-live-canvas", () => {
      if (currentCanvas) {
        socket.to(currentCanvas).emit("clear-live-canvas");
      }
    });

    socket.on("clear-canvas", () => {
      if (currentCanvas) {
        console.log(`[Server] clear-canvas from ${socket.id}`);
        socket.to(currentCanvas).emit("clear-canvas");
      }
    });
  
    socket.on("add-text", (data) => {
      if (currentCanvas) {
        socket.to(currentCanvas).emit("add-text", data);
        console.log(`[Server] add-text from ${socket.id}:`, data);
      }
    });
  
    socket.on("update-text", (data) => {
      if (currentCanvas) {
        socket.to(currentCanvas).emit("update-text", data);
        console.log(`[Server] update-text from ${socket.id}:`, data);
      }
    });
  
    socket.on("delete-text", ({ id }) => {
      if (currentCanvas) {
        socket.to(currentCanvas).emit("delete-text", { id });
        console.log(`[Server] delete-text from ${socket.id}:`, id);
      }
    });

};