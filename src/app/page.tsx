"use client";

import {useRef, useState } from "react";

import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
} from 'ai'; 


import ChatInput from "./components/ChatInput";
import MessageBubble from "./components/MessageBubble";
import DraftMarketingEmailToolDisplay from "@/tools/DraftMarketingEmailDisplay";
// import EditEmailToolDisplay from "@/tools/EditEmailToolDisplay";
import ImageSidebar from "./components/ImageSidebar"; 
import EditEmailToolDisplay from "@/tools/EditEmailToolDisplay";

// takes in one messsage at a time (as m) from the useChat hook
const messageRenderer = ( m: any) => {

  // return one div for each step
  return (
    <div key={m.id}>
      <br></br>
      <br></br>
      {m.parts?.map((part: any) => { 

        if (part.type === 'text') {
          return <MessageBubble role={m.role} key={"text-" + part.id}>
            {part.text}
          </MessageBubble>
        } else if (
          part.type === 'data-tool-run'  
          && (part.data?.status === 'done' || part.data?.status === 'streaming')
        ) {
          if (part.data?.tool === 'DraftMarketingEmail') {
          // TOOD - this should all be moved into component... 
            return <DraftMarketingEmailToolDisplay 
              key={part.id}
              text={part.data?.text} 
              output={part.data?.final}
              status={part.state}
            />
          } else if (part.data?.tool === 'editEmail') {
            return <EditEmailToolDisplay
                key={part.id}
                text={part.data?.text} 
                output={part.data?.final}
                status={part.state} 
            />
          }
        }
    })}
    </div>
  )
 
}

       

export default function Home() {
  const [input, setInput] = useState('');

  const listRef = useRef<HTMLDivElement | null>(null);  

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }), 

  }); 

  console.log("MESSAGES", messages);
 
  return (
    <div
      style={{
        height: "100dvh",
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        gridTemplateRows: "1fr auto",
        backgroundColor: "#202123",
        color: "#ECECEC",
      }}
    >
      <div style={{ gridRow: "1 / span 2", gridColumn: 1, minWidth: 150 }}>
        <ImageSidebar />
      </div>

      <div
        ref={listRef}
        style={{
          overflowY: "auto",
          padding: "24px 0 100px",
          gridColumn: 2,
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
          {messages.length === 0 && (
            <div style={{ opacity: 0.7, textAlign: "center", marginTop: 32 }}>
              Start a conversation below.
            </div>
          )}
  
          {messages.map((m: any) => { 
            return messageRenderer(m);
          })}
 
          {status === "streaming" && (
            <div style={{ opacity: 0.7, marginTop: 8 }}>Thinking…</div>
          )}
        </div>
      </div>

      <div style={{ gridColumn: 2 }}>
        <ChatInput
          value={input}
          setValue={setInput}
          sendMessage={(text) =>  sendMessage({ text })} 
          isLoading={status === "streaming" || status === "submitted"}
        />
      </div>
    </div>
  );
}

