// Function to encode data and call Android to save the file
export function saveFile(base64Data: string, filename: string): void {
    // Ensure AndroidInterface is available before calling the method
    if (window.AndroidInterface && typeof window.AndroidInterface.saveFile === 'function') {
        window.AndroidInterface.saveFile(base64Data, filename);
    }
}

// Function to encode data and call Android to print the file
export function printBase64File(base64Data: string, filename: string): void {
    // Ensure AndroidInterface is available before calling the method
    if (window.AndroidInterface && typeof window.AndroidInterface.printBase64File === 'function') {
        window.AndroidInterface.printBase64File(base64Data, filename);
    }
}
