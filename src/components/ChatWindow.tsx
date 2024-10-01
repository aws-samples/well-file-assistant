// import { TextContent, Button, Box, ScrollView, Text } from '@cloudscape-design/components';
// import { useState } from 'react';

// interface Message {
//   text: string;
//   fromUser: boolean;
// }

// const ChatWindow: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');

//   const handleSend = () => {
//     if (input.trim()) {
//       setMessages(prevMessages => [
//         ...prevMessages,
//         { text: input, fromUser: true }
//       ]);
//       setInput('');
//       // Simulate receiving a message
//       setTimeout(() => {
//         setMessages(prevMessages => [
//           ...prevMessages,
//           { text: input, fromUser: true },
//           { text: 'Received: ' + input, fromUser: false }
//         ]);
//       }, 1000);
//     }
//   };

//   return (
//     <Box padding="l" style={{ height: '80vh', display: 'flex', flexDirection: 'column', border: '1px solid #ddd' }}>
//       <ScrollView
//         style={{ flex: 1 }}
//         scrollable
//         overflow="auto"
//         padding="s"
//       >
//         {messages.map((msg, index) => (
//           <Box key={index} marginBottom="s" textAlign={msg.fromUser ? 'right' : 'left'}>
//             <Text>{msg.text}</Text>
//           </Box>
//         ))}
//       </ScrollView>
//       <Box marginTop="s" display="flex" alignItems="center">
//         <TextField
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type a message..."
//           flex="1"
//         />
//         <Button onClick={handleSend} marginLeft="s">Send</Button>
//       </Box>
//     </Box>
//   );
// };

// export default ChatWindow;
