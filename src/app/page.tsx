"use client";

import {useRef, useState } from "react";

import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai'; 


import ChatInput from "./components/ChatInput";
import MessageBubble from "./components/MessageBubble";
import DraftMarketingEmailToolDisplay from "@/tools/DraftMarketingEmailDisplay";
import EditEmailToolDisplay from "@/tools/EditEmailToolDisplay";
import ImageSidebar from "./components/ImageSidebar"; 

type Part = { type: string; [k: string]: any };

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
        } else if (part.type === 'data-tool-run' && part.data?.tool === 'DraftMarketingEmail' ) {
          // TOOD - this should all be moved into component... 

          if (part.data?.status === 'streaming') {
            return ( 
              <div key={"tool-DraftMarketingEmail-other" + part.id}> 
                <DraftMarketingEmailToolDisplay 
                  key ={"tool-DraftMarketingEmail-display-1" + part.id} 
                  status={part.state} 
                  output={undefined} 
                  text={part.data?.text} 
                />  

                <div> STEP {part.index} </div> 
                <div key={part.index}> {JSON.stringify(part, null, 2)} </div>
              </div> 
          )
          } else if (part.data?.status === 'done') {
            return (
              <div key={"tool-DraftMarketingEmail-other" + part.id}> 
                <DraftMarketingEmailToolDisplay 
                  key ={"tool-DraftMarketingEmail-display-1" + part.id} 
                  status={part.state} 
                  output={part.data?.final} 
                  text={undefined} 
                />  
                <div> STEP {part.index} </div> 
                <div key={part.index}> {JSON.stringify(part, null, 2)} </div>
              </div>
            )
          }      
      } else if (part.type === 'data-tool-run' && part.data?.tool === 'editEmail' ) {
        return (
          <div key={"tool-editEmail-other" + part.id}> 
            <EditEmailToolDisplay part={part} />  
          </div>
        )
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

