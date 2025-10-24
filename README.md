Here’s a structured description of the **Socket API Endpoints** for your Astrologer-User Chat Billing System:

---

# **Socket API Endpoints**

## **1. Chat Request Handling**

### **`chat-request`**

**Purpose:**  
Handle incoming chat requests from users to astrologers.

**Data (Client → Server):**

```json
{
  "userId": "USER_ID",
  "astrologerId": "ASTROLOGER_ID",
  "chatType": "text|audio|video"
}
```

**Response (Server → Client):**

- Event: `chat-request-response`
  ```json
  {
    "status": "success|error",
    "message": "Chat request sent to astrologer.",
    "data": {
      "roomId": "ROOM_ID",
      "astrologerId": "ASTROLOGER_ID"
    }
  }
  ```

---

## **2. Astrologer Accept/Reject Chat**

### **`chat-response`**

**Purpose:**  
Astrologer accepts or rejects a chat request.

**Data (Client → Server):**

```json
{
  "roomId": "ROOM_ID",
  "response": "accept|reject"
}
```

**Response (Server → Client):**

- Event: `chat-status`
  ```json
  {
    "status": "accepted|rejected",
    "message": "Astrologer has accepted/rejected the request.",
    "roomId": "ROOM_ID"
  }
  ```

---

## **3. Start Chat Session**

### **`start-chat`**

**Purpose:**  
Start a chat session once the astrologer accepts the request.

**Data (Client → Server):**

```json
{
  "roomId": "ROOM_ID"
}
```

**Response (Server → Client):**

- Event: `chat-started`
  ```json
  {
    "status": "success",
    "message": "Chat session started.",
    "startTime": "TIMESTAMP"
  }
  ```

---

## **4. Pause/Resume Chat Session**

### **`pause-chat`**

**Purpose:**  
Pause the ongoing chat session.

**Data (Client → Server):**

```json
{
  "roomId": "ROOM_ID"
}
```

**Response (Server → Client):**

- Event: `chat-paused`
  ```json
  {
    "status": "success",
    "message": "Chat paused successfully."
  }
  ```

---

### **`resume-chat`**

**Purpose:**  
Resume a paused chat session.

**Data (Client → Server):**

```json
{
  "roomId": "ROOM_ID"
}
```

**Response (Server → Client):**

- Event: `chat-resumed`
  ```json
  {
    "status": "success",
    "message": "Chat resumed successfully."
  }
  ```

---

## **5. End Chat Session**

### **`end-chat`**

**Purpose:**  
End the ongoing chat session.

**Data (Client → Server):**

```json
{
  "roomId": "ROOM_ID"
}
```

**Response (Server → Client):**

- Event: `chat-ended`
  ```json
  {
    "status": "success",
    "message": "Chat session ended.",
    "duration": "DURATION_IN_MINUTES",
    "totalCost": "TOTAL_COST"
  }
  ```

---

## **6. Real-Time Notifications**

### **`chat-timer`**

**Purpose:**  
Send real-time updates on the chat duration and cost to the user.

**Response (Server → Client):**

- Event: `chat-timer`
  ```json
  {
    "roomId": "ROOM_ID",
    "duration": "DURATION_IN_MINUTES",
    "cost": "COST_SO_FAR"
  }
  ```

---

## **7. Error Handling**

### **`chat-error`**

**Purpose:**  
Send errors related to chat operations.

**Response (Server → Client):**

- Event: `chat-error`
  ```json
  {
    "error": "ERROR_CODE",
    "message": "ERROR_MESSAGE"
  }
  ```

---

## **8. Wallet Insufficient Funds**

### **`wallet-error`**

**Purpose:**  
Notify the user if their wallet balance is insufficient to continue the chat.

**Response (Server → Client):**

- Event: `wallet-error`
  ```json
  {
    "status": "error",
    "message": "Insufficient wallet balance to continue the chat.",
    "requiredBalance": "MINIMUM_REQUIRED_BALANCE"
  }
  ```

---

## **9. Admin Monitoring**

### **`admin-monitor`**

**Purpose:**  
Admin can monitor ongoing chat sessions.

**Data (Admin → Server):**

```json
{
  "action": "view-chats|end-chat",
  "roomId": "ROOM_ID"
}
```

**Response (Server → Admin):**

```json
{
  "status": "success|error",
  "message": "Action performed successfully."
}
```

---

## **Real-Time Flow**

1. **User initiates a chat** → `chat-request`.
2. **Astrologer responds** → `chat-response`.
3. **Chat session starts** → `start-chat`.
4. **Real-time billing updates** → `chat-timer`.
5. **Pause/Resume chat** → `pause-chat` / `resume-chat`.
6. **Chat session ends** → `end-chat`.

---

This detailed documentation ensures clarity for socket events, making it easier for developers to integrate and test the API. Let me know if you need further customization or more features!
