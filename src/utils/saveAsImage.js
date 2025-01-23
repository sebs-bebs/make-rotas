import html2canvas from 'html2canvas';

export async function saveAsImage(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`No element found with id: ${elementId}`);
    return;
  }
  try {
    // Add a class to the body during capture
    document.body.classList.add('capturing-image');

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth * 2,
      windowHeight: element.scrollHeight * 2,
      scrollX: 0,
      scrollY: 0,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // Remove the class after capture
    document.body.classList.remove('capturing-image');

    const dataURL = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    link.click();
  } catch (error) {
    console.error('Error capturing image:', error);
    // Remove the class in case of error
    document.body.classList.remove('capturing-image');
  }
}
