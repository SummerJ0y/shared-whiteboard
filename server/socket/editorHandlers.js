// socket/editorHandlers.js
module.exports = function setupEditorHandlers(socket, io) {
    let currentEditorRoom = null;
  
    socket.on("join-editor", (editorId) => {
      if (currentEditorRoom) {
        socket.leave(currentEditorRoom);
      }
      socket.join(editorId);
      currentEditorRoom = editorId;
      console.log(`Socket ${socket.id} joined editor ${editorId}`);
    });
  
    socket.on("editor-update", ({ editorId, content }) => {
      // Broadcast to others in the same editor room
      socket.to(editorId).emit("editor-update", { content });
    });
  
    // Optional: send current content back to new user (implement if needed)
    // You can maintain a `roomContentMap` if you want stateful sync on join
  };
  