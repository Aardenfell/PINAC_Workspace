import React, { useState, useEffect } from "react";
import { MarkdownStyle } from "./MarkdownStyle";
import styles from "../style/MessageBubble.module.css";

// Icons
import pinacLogo from "../../../assets/icon/pinac-logo.png";

//
interface ShowAiMessageProps {
  setButtonsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ShowAiMessage: React.FC<ShowAiMessageProps> = ({
  setButtonsDisabled,
}) => {
  const [message, setMessage] = useState(<AiLoader />);

  // fetching AI response from backend
  window.ipcRenderer.once("server-response", (_, response) => {
    if (response["error_occurred"]) {
      setMessage(
        <AiMsgBubble
          response={`**${response["error"]}**\nTry again :(`}
          setButtonsDisabled={setButtonsDisabled}
        />
      );
    } else {
      setMessage(
        <AiMsgBubble
          response={response["response"]["content"]}
          setButtonsDisabled={setButtonsDisabled}
        />
      );
    }
  });
  return <>{message}</>;
};

//
//
interface AiMsgBubbleProps {
  response: string;
  setButtonsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const AiMsgBubble: React.FC<AiMsgBubbleProps> = (props) => {
  const { setButtonsDisabled } = props;
  const [isAvatarVisible, setIsAvatarVisible] = useState(
    window.innerWidth > 576
  );

  // Button
  const copyToClipboard = () => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(props.response)
        .then(() => {
          const copyBtn = document.querySelector(".copy_btn");
          if (copyBtn) {
            copyBtn.classList.add("animate");
            setTimeout(() => {
              copyBtn.classList.remove("animate");
            }, 1000);
          }
        })
        .catch((error) => {
          console.error("Failed to copy:", error);
        });
    }
  };

  //
  // for UI responsiveness
  useEffect(() => {
    const updateAvatarVisibility = () => {
      setIsAvatarVisible(window.innerWidth > 576);
    };
    window.addEventListener("resize", updateAvatarVisibility);
    return () => window.removeEventListener("resize", updateAvatarVisibility);
  }, []);

  // ---------------------------------- //
  return (
    <>
      <div className={styles.msg_row}>
        {isAvatarVisible && (
          <div className={styles.msg_avatar}>
            <img src={pinacLogo} alt="AI Avatar" />
          </div>
        )}
        <div className={styles.msg_content}>
          <div className={styles.msg_btn}>
            <div className={styles.msg_name}>PINAC</div>
          </div>
          <div className={`${styles.msg_text} ${styles.ai_msg}`}>
            <MarkdownStyle
              text={props.response}
              setButtonsDisabled={setButtonsDisabled}
            />
          </div>
          <div className={styles.ai_msg_copy_btn}>
            <button
              className={styles.copy_btn}
              onClick={() => copyToClipboard()}
            >
              copy
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

//
//
// Creating a AiLoader component similar to AiMessage. message state is initialized with this loader and replaced as soon as we have the data.
const AiLoader: React.FC = () => {
  const [isAvatarVisible, setIsAvatarVisible] = useState(
    window.innerWidth > 576
  );

  //
  // Handle window resize and update avatar visibility
  useEffect(() => {
    const updateAvatarVisibility = () => {
      setIsAvatarVisible(window.innerWidth > 576);
    };
    window.addEventListener("resize", updateAvatarVisibility);
    // Cleanup function to remove the event listener
    return () => window.removeEventListener("resize", updateAvatarVisibility);
  }, []);

  // ---------------------------------- //
  return (
    <>
      <div className={styles.msg_row}>
        {isAvatarVisible && (
          <div className={styles.msg_avatar}>
            <img src={pinacLogo} alt="AI Avatar" />
          </div>
        )}
        <div className={styles.msg_content}>
          <div className={styles.msg_btn}>
            <div className={styles.msg_name}>PINAC</div>
          </div>
          <div className={`${styles.msg_text} ${styles.ai_msg}`}>
            <div className={styles.loader} />
          </div>
        </div>
      </div>
    </>
  );
};