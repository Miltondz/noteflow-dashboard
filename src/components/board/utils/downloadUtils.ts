import JSZip from 'jszip';
import { NoteData } from '../types';

export const downloadDashboard = async (notes: NoteData[], dashboardTitle: string = 'dashboard') => {
  const zip = new JSZip();
  const folder = zip.folder(dashboardTitle);
  
  if (!folder) {
    throw new Error('Failed to create zip folder');
  }

  // Counter for naming files
  let textCounter = 1;
  let imageCounter = 1;

  for (const note of notes) {
    if (note.type === 'image' && note.content) {
      try {
        // Download image and add to zip
        const response = await fetch(note.content);
        const blob = await response.blob();
        const extension = note.content.split('.').pop() || 'png';
        folder.file(`image_${imageCounter}.${extension}`, blob);
        imageCounter++;
      } catch (error) {
        console.error('Failed to download image:', error);
      }
    } else if (['text', 'sticky-note', 'document'].includes(note.type)) {
      // Add text content to zip
      const fileName = `${note.type}_${textCounter}.txt`;
      folder.file(fileName, note.content || '');
      textCounter++;
    }
  }

  // Generate and download the zip file
  const content = await zip.generateAsync({ type: 'blob' });
  const url = window.URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${dashboardTitle}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};