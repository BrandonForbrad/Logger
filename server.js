const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");

const PORT = process.env.PORT || 3000;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Track active users per room (task or system)
const activeUsers = new Map();
// Track content versions for conflict resolution
const contentVersions = new Map();
// Track cursor positions
const cursorPositions = new Map();

// Generate a unique color for each user
function getUserColor(username) {
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', 
    '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4'
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  // Join a room (task:123 or system:456)
  socket.on("join", (data) => {
    const { room, username } = data;
    socket.join(room);
    socket.username = username;
    socket.currentRoom = room;
    socket.userColor = getUserColor(username);
    
    // Track active users in room
    if (!activeUsers.has(room)) {
      activeUsers.set(room, new Map());
    }
    if (!cursorPositions.has(room)) {
      cursorPositions.set(room, new Map());
    }
    
    activeUsers.get(room).set(socket.id, { 
      username, 
      oditing: null, 
      color: socket.userColor,
      socketId: socket.id
    });
    
    // Send current cursors to new user
    socket.emit("cursors-sync", {
      cursors: Array.from(cursorPositions.get(room).entries()).map(([id, pos]) => ({
        ...pos,
        socketId: id
      }))
    });
    
    // Broadcast updated user list with colors
    io.to(room).emit("users-updated", {
      users: Array.from(activeUsers.get(room).values())
    });
    
    console.log(`${username} joined ${room}`);
  });
  
  // Cursor position update
  socket.on("cursor-update", (data) => {
    const { room, field, position, username } = data;
    if (cursorPositions.has(room)) {
      cursorPositions.get(room).set(socket.id, {
        username,
        field,
        position,
        color: socket.userColor
      });
      socket.to(room).emit("cursor-moved", {
        socketId: socket.id,
        username,
        field,
        position,
        color: socket.userColor
      });
    }
  });
  
  // Selection update
  socket.on("selection-update", (data) => {
    const { room, field, start, end, username } = data;
    socket.to(room).emit("selection-changed", {
      socketId: socket.id,
      username,
      field,
      start,
      end,
      color: socket.userColor
    });
  });
  
  // User started editing a field
  socket.on("editing-start", (data) => {
    const { room, field, username } = data;
    if (activeUsers.has(room) && activeUsers.get(room).has(socket.id)) {
      activeUsers.get(room).get(socket.id).editing = field;
      socket.to(room).emit("user-editing", { 
        username, 
        field,
        color: socket.userColor,
        socketId: socket.id
      });
    }
  });
  
  // User stopped editing
  socket.on("editing-stop", (data) => {
    const { room, field, username } = data;
    if (activeUsers.has(room) && activeUsers.get(room).has(socket.id)) {
      activeUsers.get(room).get(socket.id).editing = null;
      // Remove cursor
      if (cursorPositions.has(room)) {
        cursorPositions.get(room).delete(socket.id);
      }
      socket.to(room).emit("user-stopped-editing", { 
        username, 
        field,
        socketId: socket.id
      });
    }
  });
  
  // Content update with version tracking
  socket.on("content-update", (data) => {
    const { room, field, value, username, version, cursorPos } = data;
    const key = `${room}:${field}`;
    
    // Track version
    if (!contentVersions.has(key)) {
      contentVersions.set(key, 0);
    }
    const newVersion = contentVersions.get(key) + 1;
    contentVersions.set(key, newVersion);
    
    socket.to(room).emit("content-changed", { 
      field, 
      value, 
      username,
      version: newVersion,
      fromSocketId: socket.id
    });
  });
  
  // Task property update (priority, assignees, due date)
  socket.on("property-update", (data) => {
    const { room, property, value, username } = data;
    socket.to(room).emit("property-changed", { property, value, username });
  });
  
  // Checklist item toggled
  socket.on("checklist-toggle", (data) => {
    const { room, itemId, completed, username } = data;
    socket.to(room).emit("checklist-toggled", { itemId, completed, username });
  });
  
  // Checklist item added
  socket.on("checklist-add", (data) => {
    const { room, item, username } = data;
    socket.to(room).emit("checklist-added", { item, username });
  });
  
  // Checklist item deleted
  socket.on("checklist-delete", (data) => {
    const { room, itemId, username } = data;
    socket.to(room).emit("checklist-deleted", { itemId, username });
  });
  
  // Task completed/uncompleted
  socket.on("task-toggle", (data) => {
    const { room, taskId, completed, username } = data;
    socket.to(room).emit("task-toggled", { taskId, completed, username });
  });
  
  // Task created
  socket.on("task-created", (data) => {
    const { room, task, username } = data;
    socket.to(room).emit("task-added", { task, username });
  });
  
  // Task deleted
  socket.on("task-deleted", (data) => {
    const { room, taskId, username } = data;
    socket.to(room).emit("task-removed", { taskId, username });
  });
  
  // Task reordered
  socket.on("tasks-reordered", (data) => {
    const { room, taskIds, username } = data;
    socket.to(room).emit("tasks-order-changed", { taskIds, username });
  });
  
  // Attachment added
  socket.on("attachment-add", (data) => {
    const { room, attachment, username } = data;
    socket.to(room).emit("attachment-added", { attachment, username });
  });
  
  // Attachment deleted
  socket.on("attachment-delete", (data) => {
    const { room, attachmentId, username } = data;
    socket.to(room).emit("attachment-deleted", { attachmentId, username });
  });
  
  // Handle disconnect
  socket.on("disconnect", () => {
    if (socket.currentRoom && activeUsers.has(socket.currentRoom)) {
      activeUsers.get(socket.currentRoom).delete(socket.id);
      
      // Remove cursor
      if (cursorPositions.has(socket.currentRoom)) {
        cursorPositions.get(socket.currentRoom).delete(socket.id);
      }
      
      // Broadcast cursor removal
      io.to(socket.currentRoom).emit("cursor-removed", {
        socketId: socket.id
      });
      
      // Broadcast updated user list
      io.to(socket.currentRoom).emit("users-updated", {
        users: Array.from(activeUsers.get(socket.currentRoom).values())
      });
      
      // Notify others this user stopped editing
      if (socket.username) {
        socket.to(socket.currentRoom).emit("user-stopped-editing", { 
          username: socket.username, 
          field: null,
          socketId: socket.id
        });
      }
      
      // Clean up empty rooms
      if (activeUsers.get(socket.currentRoom).size === 0) {
        activeUsers.delete(socket.currentRoom);
        cursorPositions.delete(socket.currentRoom);
      }
    }
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Daily Logger running at http://localhost:${PORT}`);
});
