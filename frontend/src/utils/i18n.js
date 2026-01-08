const strings = {
  en: {
    sent: 'sent',
    delivered: 'delivered',
    read: 'read',
    conversations: 'Conversations',
    loadingConversations: 'Loading conversations...',
    noConversations: 'No conversations yet.',
    selectConversation: 'Select a conversation',
    typeMessage: 'Type a message'
  }
};

let locale = 'en';

export function setLocale(l) {
  locale = l || 'en';
}

export function t(key) {
  return (strings[locale] && strings[locale][key]) || key;
}

export default { t, setLocale };
