import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, Timestamp, onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { FriendReadingNote } from '../components/skills/LocalEBookReader';

// Fetch friends who are currently reading a specific book
export const getFriendsReading = async (bookId: string, friendIds: string[]) => {
  // Mocking friend IDs for now as we don't have a full friend list yet
  const q = query(
    collection(db, 'userBooks'),
    where('bookId', '==', bookId),
    where('status', '==', 'reading')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ userId: doc.data().userId, ...doc.data() }));
};

// Annotation CRUD
export const addAnnotation = async (bookId: string, userId: string, annotationData: any) => {
  const docRef = await addDoc(collection(db, 'books', bookId, 'annotations'), {
    ...annotationData,
    userId,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const addDiscussion = async (annotationId: string, userId: string, comment: string) => {
  await addDoc(collection(db, 'annotations', annotationId, 'discussions'), {
    userId,
    comment,
    createdAt: Timestamp.now()
  });
};
