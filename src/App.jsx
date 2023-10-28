import "./App.css";
import { initializeApp } from "firebase/app";
import {
  collection,
  getFirestore,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const firestore = getFirestore();

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <button
        className="px-4 py-2 text-xl font-semibold rounded-xl bg-white flex gap-x-2 items-center"
        onClick={signInWithGoogle}
      >
        <div>Sign in with Google</div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="32"
          height="32"
          viewBox="0 0 48 48"
        >
          <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          ></path>
          <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          ></path>
          <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          ></path>
          <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          ></path>
        </svg>
      </button>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button
        className="rounded-full text-white font-bold text-base px-4 py-2 bg-red-500"
        onClick={() => auth.signOut()}
      >
        Sign out
      </button>
    )
  );
}

function ChatRoom() {
  const messageRef = collection(firestore, "messages");

  const dummyRef = useRef();
  const [messages, setMessages] = useState([]);
  const [formValue, setFormValue] = useState("");

  const q = query(messageRef, orderBy("createdAt"));

  useEffect(() => {
    onSnapshot(q, (snapshot) => {
      let records = [];
      snapshot.docs.forEach((doc) => {
        records.push({ ...doc.data(), id: doc.id });
      });
      setMessages(records);
    });
  }, []);

  const onSendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    const message = await addDoc(messageRef, {
      uid,
      photoURL,
      text: formValue,
      createdAt: serverTimestamp(),
      displayName,
    });
    setFormValue("");
    dummyRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full px-4 mx-auto max-w-7xl">
      <header className="h-16 fixed top-0 left-0 right-0 w-full bg-gray-400 z-50 text-2xl p-4 flex items-center justify-between">
        Hi, {auth.currentUser.displayName} 👋
        <SignOut />
      </header>
      <div className="flex flex-col mb-16 mt-20">
        {messages &&
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              index={index}
              messagesUid={messages.map((el) => el.uid)}
            />
          ))}
        <div ref={dummyRef} />
      </div>
      <form onSubmit={onSendMessage}>
        <div className="w-full max-w-7xl flex bg-[#202329] pb-4 fixed bottom-0">
          <input
            className="flex-1 bg-[#202329] focus-visible:outline-0 text-white h-12"
            placeholder="Write a message..."
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
          />
          <button className="w-8" disabled={!formValue} type="submit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="32"
              height="32"
            >
              <path
                fill={!formValue ? "gray" : "#6b8afd"}
                d="M1.94631 9.31555C1.42377 9.14137 1.41965 8.86034 1.95706 8.6812L21.0433 2.31913C21.5717 2.14297 21.8748 2.43878 21.7268 2.95706L16.2736 22.0433C16.1226 22.5718 15.8179 22.5901 15.5946 22.0877L12.0002 14.0002L18.0002 6.00017L10.0002 12.0002L1.94631 9.31555Z"
              ></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

function ChatMessage(props) {
  const { message, index, messagesUid } = props;
  const { text, uid, photoURL, displayName } = message;

  const isSent = auth.currentUser.uid === uid;
  const isLastMessageOfUser = uid !== messagesUid[index + 1];

  return (
    <div
      className={`flex gap-x-4 items-end ${isSent ? "flex-row-reverse" : ""} ${
        isLastMessageOfUser ? "mb-4" : "mb-1"
      }`}
    >
      <div className={`tooltip ${isSent ? "tooltip-sent" : ""}`}>
        {isLastMessageOfUser ? (
          photoURL ? (
            <img className="w-12 h-12 rounded-xl" src={photoURL} />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-teal-500" />
          )
        ) : (
          <div className="w-12 h-12" />
        )}
        {displayName && <div className="tooltiptext">{displayName}</div>}
      </div>
      <p
        className={`p-2 min-h-[48px] text-white text-sm rounded-lg max-w-4xl ${
          isSent ? "bg-[#6b8afd]" : "bg-[#2e333d]"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function App() {
  const [user] = useAuthState(auth);

  return <div>{user ? <ChatRoom /> : <SignIn />}</div>;
}

export default App;
