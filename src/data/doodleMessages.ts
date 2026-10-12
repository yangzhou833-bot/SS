import type {ChatConversation,ChatMessage} from '../types';
import {getConversationsForRole} from './roleConversationsData';

export const DOODLE_RECEIVED='stellar_doodle_received';
export function deliverDoodleMessage(message:ChatMessage,sender:{roleId:string;name:string;avatar:string},conversation:Pick<ChatConversation,'friendId'|'friendName'|'isGroup'|'doodlePeerRoleId'>) {
  if(!message.doodleLayout||conversation.isGroup)return null;
  const target=conversation.doodlePeerRoleId || (/liam/i.test(conversation.friendName)||['f11','f-liam'].includes(conversation.friendId) ? 'friend_liam' : /sarah/i.test(conversation.friendName)||conversation.friendId==='f-sarah' ? 'friend_sarah' : conversation.friendId==='f-alex'||/alex/i.test(conversation.friendName) ? 'alex_explorer' : null);
  if(!target||target===sender.roleId)return null;
  const key=`stellar_chat_conversations_${target}`;
  let source=getConversationsForRole(target);
  try {const saved=JSON.parse(localStorage.getItem(key)||'null');if(Array.isArray(saved)&&saved.every(c=>c.id&&Array.isArray(c.messages)))source=saved;} catch {}
  const senderAlias=sender.roleId==='friend_liam' ? 'Liam' : sender.roleId==='friend_sarah' ? 'Sarah' : 'Alex';
  const aliases=senderAlias==='Liam' ? ['f11','f-liam'] : senderAlias==='Sarah' ? ['f-sarah'] : ['f-alex'];
  let peer=source.find(c=>!c.isGroup&&(c.doodlePeerRoleId===sender.roleId||aliases.includes(c.friendId)||c.friendName.includes(senderAlias)));
  if(!peer){peer={id:`doodle-${target}-${sender.roleId}`,friendId:aliases[0],friendName:sender.name,avatar:sender.avatar,lastMessage:'',time:'',unreadCount:0,messages:[]};source=[peer,...source];}
  if(peer.messages.some(m=>m.id===message.id))return{roleId:target,conversations:source};
  const incoming={...message,senderId:sender.roleId,senderName:sender.name,senderAvatar:sender.avatar,isMe:false};
  const conversations=source.map(c=>c.id===peer!.id ? {...c,doodlePeerRoleId:sender.roleId,lastMessage:'[涂鸦 ✍️]',time:message.timestamp,unreadCount:(c.unreadCount||0)+1,messages:[...c.messages,incoming]} : c);
  localStorage.setItem(key,JSON.stringify(conversations));
  const result={roleId:target,conversations};
  window.dispatchEvent(new CustomEvent(DOODLE_RECEIVED,{detail:result}));
  return result;
}
