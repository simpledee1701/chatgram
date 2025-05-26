import { useEffect } from 'react';
import { ref, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { auth } from '../firebase/firebaseConfig';

export function usePresence(rtdb) {
  useEffect(() => {
    if (!auth.currentUser?.uid) return;

    const userId = auth.currentUser.uid;
    const userStatusRef = ref(rtdb, `status/${userId}`);
    const userStatusDatabaseRef = ref(rtdb, `status/${userId}`);

    // Set user to online with timestamp
    set(userStatusDatabaseRef, {
      status: 'online',
      lastChanged: serverTimestamp(),
    });

    // Create onDisconnect reference
    const onDisconnectRef = onDisconnect(userStatusDatabaseRef);
    onDisconnectRef.set({
      status: 'offline',
      lastChanged: serverTimestamp(),
    });

    return () => {
      onDisconnectRef.cancel();
    };
  }, [rtdb]);
}