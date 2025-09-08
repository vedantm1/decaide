
import { BlobServiceClient } from "@azure/storage-blob";

export class BlobStorageService {
  private blobServiceClient: BlobServiceClient;

  constructor(connectionString: string) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  async uploadFile(containerName: string, blobName: string, data: Buffer) {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(data, data.length);
    return blockBlobClient.url;
  }

  async downloadFile(containerName: string, blobName: string): Promise<Buffer> {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadResponse = await blockBlobClient.download(0);
    const chunks: Buffer[] = [];
    
    // @ts-ignore
    for await (const chunk of downloadResponse.readableStreamBody) {
      chunks.push(Buffer.from(chunk));
    }
    
    return Buffer.concat(chunks);
  }
}
