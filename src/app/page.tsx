import { redirect } from 'next/navigation';

// Raj's Main Page Pattern - Redirect to chat list
export default function Home() {
  redirect('/chat');
}
