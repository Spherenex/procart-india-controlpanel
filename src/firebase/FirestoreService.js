// Add these functions to your FirestoreService.js file

import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  arrayUnion,
  increment
} from 'firebase/firestore';

// Track document view events
export const trackDocumentView = async (document, productId, productName, userId) => {
  try {
    // Add to document views collection
    await addDoc(collection(db, 'documentViews'), {
      userId,
      productId,
      productName,
      documentId: document.uploadedAt || 'unknown',
      documentName: document.name,
      documentType: document.type || 'unknown',
      viewedAt: serverTimestamp()
    });
    
    // Update user's recent activity
    if (userId) {
      const userActivityRef = doc(db, 'users', userId);
      await updateDoc(userActivityRef, {
        recentActivity: arrayUnion({
          type: 'documentView',
          productId,
          productName,
          documentName: document.name,
          timestamp: new Date().toISOString()
        }),
        documentViewCount: increment(1)
      });
    }
    
    // Update product document view statistics
    const productStatsRef = doc(db, 'productStats', productId);
    await updateDoc(productStatsRef, {
      [`documentViews.${document.name.replace(/\./g, '_')}`]: increment(1)
    });
    
    console.log('Document view tracked successfully');
  } catch (error) {
    console.error('Error tracking document view:', error);
  }
};

// Track document download events
export const trackDocumentDownload = async (document, productId, productName, userId) => {
  try {
    // Add to document downloads collection
    await addDoc(collection(db, 'documentDownloads'), {
      userId,
      productId,
      productName,
      documentId: document.uploadedAt || 'unknown',
      documentName: document.name,
      documentType: document.type || 'unknown',
      downloadedAt: serverTimestamp()
    });
    
    // Update user's recent activity
    if (userId) {
      const userActivityRef = doc(db, 'users', userId);
      await updateDoc(userActivityRef, {
        recentActivity: arrayUnion({
          type: 'documentDownload',
          productId,
          productName,
          documentName: document.name,
          timestamp: new Date().toISOString()
        }),
        documentDownloadCount: increment(1)
      });
    }
    
    // Update product document download statistics
    const productStatsRef = doc(db, 'productStats', productId);
    await updateDoc(productStatsRef, {
      [`documentDownloads.${document.name.replace(/\./g, '_')}`]: increment(1)
    });
    
    console.log('Document download tracked successfully');
  } catch (error) {
    console.error('Error tracking document download:', error);
  }
};