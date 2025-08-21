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
import CritiqueEmailToolDisplay from "@/tools/CritiqueEmailToolDisplay";
import ImageSidebar from "./components/ImageSidebar"; 

type Part = { type: string; [k: string]: any };

export type StepChunk = {
  index: number;          // 0-based step number
  startIndex: number;     // index in message.parts where this step started (the step-start part)
  parts: Part[];          // parts between this step-start and the next step-start
};

export function splitByStepStart(parts: Part[]): StepChunk[] {
  const steps: StepChunk[] = [];
  let current: StepChunk | null = null;

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];

    if (p.type === 'step-start') {
      // begin a new step bucket
      current = { index: steps.length, startIndex: i, parts: [] };
      steps.push(current);
      continue;
    }

    // if there was no step-start yet, start an implicit step 0
    if (!current) {
      current = { index: 0, startIndex: -1, parts: [] };
      steps.push(current);
    }

    current.parts.push(p);
  }

  return steps;
}

const messageRenderer = ( m: any) => {

  // only log the last message
   console.log("MESSAGE", m); 

  const steps = splitByStepStart(m.parts);
  console.log("STEPS", steps);

  return <><br></br><br></br><div key={m.id} >  {JSON.stringify(m.parts, null, 2)}</div></>

  // return  <div key={m.id} >{m.parts}</div>


  
  // return (
  //   <div key={m.id} style={{ marginBottom: 12 }}>
  //     {steps?.map((step: any) => {
  //       console.log("STEP", step);

  //       return (
  //         <div key={step.index}> 
  //         {step}
  //         </div>
  //       )
  //     })}
  //   </div>
  // );
}

      
        // const messageText = step.parts?.filter((p: any) => p.type === 'text').map((p: any)  => p.text).join('');
        // const dataToolText = step.parts?.filter((p: any) => p.type === 'data-tool-run').map((p: any)  => p.data?.text).join('');
        // const output = s.parts?.filter((p: any) => p.type === 'tool-DraftMarketingEmail').map((p: any)  => p.output).join('');
        // const status = s.parts?.filter((p: any) => p.type === 'tool-DraftMarketingEmail').map((p: any)  => p.state).join('');
        //   if (messageText) {
        //     return <MessageBubble role={m.role} key={p.id + m.id}>
        //       {messageText}
        //     </MessageBubble>
        //   }
        //   if (p.type === "tool-DraftMarketingEmail" || (p.type === "data-tool-run" && p.data?.status === "streaming")) {
        //     console.log("TOOL-DRAFT-MARKETING-EMAIL", p);
        //     return <DraftMarketingEmailToolDisplay 
        //       key ={"tool-DraftMarketingEmail" + m.id} 
        //       status={p.state} 
        //       output={output} 
        //       text={dataToolText} 
        //       />
        //   }  
        // }
    


export default function Home() {
  const [input, setInput] = useState('');

  const listRef = useRef<HTMLDivElement | null>(null);  

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

  }); 

  console.log("hello", messages);
 
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

