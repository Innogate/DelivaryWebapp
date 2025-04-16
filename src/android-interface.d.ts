// src/android-interface.d.ts
interface AndroidInterface {
    saveFile(base64Data: string, filename: string): void;
    printBase64File(base64Data: string, filename: string): void;
  }
  
  declare global {
    interface Window {
      AndroidInterface: AndroidInterface;
    }
  }
  
  export {};
  