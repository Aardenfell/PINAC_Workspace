import React, { createContext, useContext, useReducer, ReactNode } from "react";

// Define the shape of the state
interface ChatState {
  chatHistory: JSX.Element[];
  stop: boolean;
}

// Define the actions
type Action =
  | { type: "ADD_MESSAGE"; message: JSX.Element }
  | { type: "CLEAR_CHAT" }
  | { type: "SET_STOP"; stop: boolean };

// Create a reducer to manage the state
const chatReducer = (state: ChatState, action: Action): ChatState => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.message],
      };
    case "CLEAR_CHAT":
      return {
        ...state,
        chatHistory: [],
      };
    case "SET_STOP":
      return {
        ...state,
        stop: action.stop,
      };
    default:
      return state;
  }
};

// Create a context
const ChatContext = createContext<{ state: ChatState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

// Create a provider component
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, { chatHistory: [], stop: false });

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};

// Create a hook to use the chat context
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
