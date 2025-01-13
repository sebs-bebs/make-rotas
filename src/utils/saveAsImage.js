import html2canvas from 'html2canvas';

export async function saveAsImage(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`No element found with id: ${elementId}`);
    return;
  }
  try {
    const canvas = await html2canvas(element);
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    link.click();
  } catch (error) {
    console.error('Error capturing image:', error);
  }
}
