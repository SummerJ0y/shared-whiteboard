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