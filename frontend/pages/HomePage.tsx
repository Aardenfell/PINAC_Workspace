import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { ShowHumanMessage, ShowAiMessage } from "../components/MessageViewer";
import { useChatContext  } from "../components/context_file";
import { FaRegStopCircle } from "react-icons/fa";
import "./style/HomePage.css";

// Icons
import sendIcon from "../assets/icon/send.svg";

// interface HomePageProps {
//   chatHistory: JSX.Element[];
//   addMessageToChatHistory: (newMessage: JSX.Element) => void;
//   clearChatHistory: () => void;
// }

export const HomePage: React.FC = () => {
  const [userInput, setUserInput] = useState<string>(""); // Declare state for input value
  const [isUserInputActive, setUserInputActive] = useState<boolean>(false); // Declare state for input value
  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false); // For disabling send button
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { state, dispatch } = useChatContext();

  // Handles changes in user input
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(event.target.value);
  };

  // Handles Enter key press for submitting messages
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      if (event.shiftKey) {
        // Insert a new line
        setUserInput((userInput) => userInput + "\n");
        event.preventDefault(); // Prevent the default behavior of adding a new line
      } else {
        event.preventDefault(); // Prevent default Enter behavior
        submit(userInput);
      }
    }
  };

  //
  const startNewChat = () => {
    dispatch({ type: "CLEAR_CHAT" });
    window.ipcRenderer.send("client-request-to-backend", {
      request_type: "clear-chat",
    });
    setButtonsDisabled(false);
    setUserInput("");
  };

  //
  // Actions after clicking send button or pressing Enter
  const submit = (text: string) => {
    if (/\S/.test(userInput)) {
      setButtonsDisabled(true);

      dispatch({ type: "ADD_MESSAGE", message: <ShowHumanMessage response={text} /> });

      const preferredModel = localStorage.getItem("preferred-model");
      window.ipcRenderer.send("client-request-to-server", {
        request_type: "user-input",
        preferred_model: preferredModel,
        user_query: text,
      });

      dispatch({ type: "ADD_MESSAGE", message: <ShowAiMessage setButtonsDisabled={setButtonsDisabled} /> });

      setUserInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "50px"; // Reset textarea height
      }
      // setButtonsDisabled(false);
    }
  };

  // Scroll to the bottom whenever messages change
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scrollRef = useRef<any>(null); // Ref for empty Div to server as end of messages

  useEffect(() => {
    if (state.chatHistory.length) {
      scrollRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [state.chatHistory.length]);

  useEffect(() => {
    const handleKeyup = (e: KeyboardEvent) => {
      const scHeight = (e.target as HTMLTextAreaElement).scrollHeight;
      (e.target as HTMLTextAreaElement).style.height = "50px";
      textareaRef.current!.style.height = `${scHeight}px`;

      if ((e.target as HTMLTextAreaElement).value.trim() === "") {
        // Set the textarea height back to the default
        textareaRef.current!.style.height = "50px";
      }
    };

    const textareaElement = textareaRef.current;
    if (textareaElement) {
      textareaElement.addEventListener("keyup", handleKeyup);
    }

    return () => {
      if (textareaElement) {
        textareaElement.removeEventListener("keyup", handleKeyup);
      }
    };
  }, []);

  //
  //
  // For smooth applying of current theme
  useEffect(() => {
    const body = document.body;
    const preferredTheme = localStorage.getItem("preferred-theme");
    const preferredThemePair = localStorage.getItem("preferred-theme-pair");

    // Remove all theme classes first
    body.classList.remove(
      "Dawn_n_Dusk-light",
      "Dawn_n_Dusk-dark",
      "Cyber_Tech_01-light",
      "Cyber_Tech_01-dark",
      "Aesthetics_Unbound-light",
      "Aesthetics_Unbound-dark"
    );
    // Add desired theme pair with 'light-theme' or 'dark-theme' as user previous preference
    body.classList.add(`${preferredThemePair}-${preferredTheme}`);
  });

  return (
    <>
      <Sidebar />
      <div className="container">
        <Header title="PINAC" clearChat={startNewChat} />
        <div className="chat-container">
            <div className="msg-box">
              {state.chatHistory.length === 0 ? (
                <div className="welcome-text-row">
                <div className="welcome-text">
                  Hello,
                  <br />
                  How can I help you today?
                </div>
              </div>
              ) : null}
              {state.chatHistory}
              <div ref={scrollRef} />
            </div>
          

          <div className="input-box">
            <div
              className={`input-group ${isUserInputActive ? "active" : ""}`}
              onFocus={() => setUserInputActive(true)}
              onBlur={() => setUserInputActive(false)}
            >
              <textarea
                id="user-input"
                className={buttonsDisabled ? "disabled" : ""}
                value={userInput}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Tell me your task..."
                disabled={buttonsDisabled}
                ref={textareaRef}
                required
              />
              <div className="input-group-append">
                {!buttonsDisabled ? (
                  <button
                    id="submit-btn"
                    className={buttonsDisabled ? "disabled" : ""}
                    onClick={() =>
                      userInput !== undefined ? submit(userInput) : {}
                    }
                    disabled={buttonsDisabled}
                  >
                    <img
                      src={sendIcon}
                      alt="Submit"
                      className="submit-icon changeable-icon"
                    />
                  </button>
                ) : (
                  <button onClick={() => dispatch({ type: "SET_STOP", stop: true })} className="stop-icon">
                    <FaRegStopCircle size={25} color={"gray"} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
