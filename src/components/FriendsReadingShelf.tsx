import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface FriendReading {
  userId: string;
  bookId: string;
  userName: string;
  userAvatar: string;
  title: string;
  cover: string;
}

export const FriendsReadingShelf = () => {
  const [friendsReading, setFriendsReading] = useState<FriendReading[]>([]);

  useEffect(() => {
    // In a real app, query for friendIds
    const q = query(collection(db, 'userBooks'), where('status', '==', 'reading'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as FriendReading);
      setFriendsReading(data);
    });
    return unsubscribe;
  }, []);

  if (friendsReading.length === 0) return null;

  return (
    <section className="friends-reading-shelf p-4">
      <h2 className="text-[16px] font-bold mb-3">好友正在读</h2>
      <div className="flex gap-3 overflow-x-auto">
        {friendsReading.map(f => (
          <div key={f.userId} className="flex flex-col items-center gap-1 w-20">
            <img src={f.userAvatar} alt={f.userName} className="w-12 h-12 rounded-full" />
            <span className="text-[12px] truncate w-full text-center">{f.userName}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
