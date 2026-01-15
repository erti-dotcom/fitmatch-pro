import { supabase } from '../lib/supabaseClient';
import { ChatMessage } from '../types';

export const fetchMessages = async (userId: string, partnerId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  // Map DB columns to our frontend type
  return data.map((msg: any) => ({
    id: msg.id,
    senderId: msg.sender_id,
    receiverId: msg.receiver_id,
    text: msg.text,
    timestamp: new Date(msg.created_at).getTime()
  }));
};

export const sendMessageToDb = async (senderId: string, receiverId: string, text: string) => {
  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      text: text
    });

  if (error) throw error;
};