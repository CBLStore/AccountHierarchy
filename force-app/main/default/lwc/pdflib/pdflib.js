import { LightningElement, api } from "lwc";
// Importing LightningElement and api from the LWC module for Lightning Web Components.
 
import saveTheChunkFile from "@salesforce/apex/FileUploadService.saveTheChunkFile";
// Importing the Apex method 'saveTheChunkFile' from the 'FileUploadService' Apex class.
 
import { ShowToastEvent } from "lightning/platformShowToastEvent";
// Importing the 'ShowToastEvent' class from the 'lightning/platformShowToastEvent' module.
 
import PDF_LIB from "@salesforce/resourceUrl/pdflib";
// Importing the static resource URL for 'pdflib' using Salesforce's resource URL notation.
 
import { loadScript } from "lightning/platformResourceLoader";
// Importing the 'loadScript' function from the 'lightning/platformResourceLoader' module.
 
const MAX_FILE_SIZE = 4500000;
// Defining a constant 'MAX_FILE_SIZE' with a value of 4,500,000 bytes (4.5 MB).
 
const CHUNK_SIZE = 750000;
// Defining a constant 'CHUNK_SIZE' with a value of 750,000 bytes (0.75 MB).
 
export default class ConvertImagetoPDF extends LightningElement {
  @api recordId;
  // Declaring a public API property 'recordId' to receive the record Id.
 
  fileName = "";
  // Initializing an empty string 'fileName' for file name storage.
 
  filesUploaded = [];
  // Initializing an empty array 'filesUploaded' to store uploaded files.
 
  isLoading = false;
  // Initializing a boolean 'isLoading' to track loading state.
 
  fileSize;
  // Initializing 'fileSize' to store the formatted file size.
 
  filetype;
  // Initializing 'filetype' to store the file type.
 
  renderedCallback() {
    loadScript(this, PDF_LIB).then(() => {});
    // When the component is rendered, load the script defined in 'PDF_LIB'.
  }
 
  handleFilesChange(event) {
    if (event.target.files != null) {
      this.processFilesToConvert(event.target.files);
    }
    // Handling file input change event and triggering file processing.
  }
 
  async processFilesToConvert(files) {
    if (files.length > 0) {
      const pdfDoc = await PDFLib.PDFDocument.create();
      // Create a new PDF document using the 'PDFLib' library.
 
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = file.type;
        // Loop through the selected files and retrieve file type.
 
        if (fileType === "image/png" || fileType === "image/jpeg") {
          await this.embedImageFileToPDF(pdfDoc, file);
        }
        // If the file is an image (PNG or JPEG), embed it in the PDF.
      }
     
      const pdfBytes = await pdfDoc.save();
      this.prepareFileToUpload(pdfBytes);
      // Save the PDF document and prepare it for upload.
    }
  }
 
  async embedImageFileToPDF(pdfDoc, file) {
    const base64Data = await this.readFileAsBase64(file);
 
    const image = file.type === "image/png"
      ? await pdfDoc.embedPng(base64Data)
      : await pdfDoc.embedJpg(base64Data);
 
    const pageWidth = image.width; // Set page width based on image width
    const pageHeight = image.height; // Set page height based on image height
 
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const scale = Math.min(pageWidth / image.width, pageHeight / image.height);
 
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width * scale,
      height: image.height * scale
    });
}
 
 
  async readFileAsBase64(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    // Read the file as a base64 string and resolve the promise with the result.
  }
 
  prepareFileToUpload(pdfBytes) {
    var blob = new Blob([pdfBytes], { type: "application/pdf" });
    // Create a Blob from PDF bytes.
 
    this.fileSize = this.formatBytes(blob.size, 2);
    // Format and store the file size.
 
    if (blob.size > MAX_FILE_SIZE) {
      let message =
        "File size cannot exceed " +
        MAX_FILE_SIZE +
        " bytes.\n" +
        "Selected file size: " +
        blob.size;
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error",
          message: message,
          variant: "error"
        })
      );
      return;
    }
    // Check if the file size exceeds the maximum limit and display an error toast.
 
    var reader = new FileReader();
    var self = this;
    reader.onload = function () {
      var fileContents = reader.result;
      var base64Mark = "base64,";
      var dataStart = fileContents.indexOf(base64Mark) + base64Mark.length;
      fileContents = fileContents.substring(dataStart);
      if (self.filetype != "application/pdf") self.upload(blob, fileContents);
      else self.upload(blob, pdfBytes);
    };
    reader.readAsDataURL(blob);
    // Read the Blob as a data URL and initiate the upload.
  }
 
  upload(file, fileContents) {
    var fromPos = 0;
    var toPos = Math.min(fileContents.length, fromPos + CHUNK_SIZE);
 
    this.uploadChunk(file, fileContents, fromPos, toPos, "");
    // Initiate the upload process by uploading chunks of the file.
  }
 
  uploadChunk(file, fileContents, fromPos, toPos, attachId) {
    this.isLoading = true;
    var chunk = fileContents.substring(fromPos, toPos);
 
    saveTheChunkFile({
      parentId: this.recordId,
      fileName: file.name,
      base64Data: encodeURIComponent(chunk),
      contentType: file.type,
      fileId: attachId
    })
      .then((result) => {
        attachId = result;
        fromPos = toPos;
        toPos = Math.min(fileContents.length, fromPos + CHUNK_SIZE);
        if (fromPos < toPos) {
          this.uploadChunk(file, fileContents, fromPos, toPos, attachId);
        } else {
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Success!",
              message: "File Upload Success",
              variant: "success"
            })
          );
          this.isLoading = false;
        }
      })
      .catch((error) => {
        console.error("Error: ", error);
      })
      .finally(() => {});
  }
  // Upload chunks of the file to the server and handle success or error.
 
  formatBytes(bytes, decimals) {
    if (bytes == 0) return "0 Bytes";
    var k = 1024,
      dm = decimals || 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
}