/**
 * Exercise 05: GridFS File Storage
 *
 * GridFS is MongoDB's specification for storing and retrieving large files
 * such as images, audio files, video files, etc. It divides files into chunks
 * and stores each chunk as a separate document.
 */

const { MongoClient, GridFSBucket } = require("mongodb");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class GridFSExercises {
  constructor(connectionUrl) {
    this.connectionUrl = connectionUrl || "mongodb://localhost:27017";
    this.client = null;
    this.db = null;
    this.bucket = null;
  }

  async connect() {
    this.client = new MongoClient(this.connectionUrl);
    await this.client.connect();
    this.db = this.client.db("modern_features_lab");

    // Initialize GridFS bucket
    this.bucket = new GridFSBucket(this.db, {
      bucketName: "files", // Creates 'files.files' and 'files.chunks' collections
    });

    console.log("Connected to MongoDB with GridFS");
  }

  /**
   * Create sample files for testing
   */
  async createSampleFiles() {
    const tempDir = path.join(__dirname, "temp_files");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create text file
    const textFile = path.join(tempDir, "sample_document.txt");
    fs.writeFileSync(
      textFile,
      `
MongoDB GridFS Sample Document
==============================

This is a sample text document to demonstrate GridFS functionality.
GridFS is useful for storing files larger than the BSON document size limit of 16MB.

Key Features:
- Automatic file chunking (default 255KB per chunk)
- Metadata storage
- Streaming capabilities
- Efficient for large files

Use Cases:
- User uploaded files
- Media storage (images, videos, audio)
- Document management systems
- Backup storage
    `.trim()
    );

    // Create JSON file
    const jsonFile = path.join(tempDir, "sample_data.json");
    fs.writeFileSync(
      jsonFile,
      JSON.stringify(
        {
          title: "Sample Data",
          description: "JSON data for GridFS testing",
          timestamp: new Date().toISOString(),
          data: Array.from({ length: 100 }, (_, i) => ({
            id: i,
            value: Math.random() * 1000,
            text: `Item ${i}`,
          })),
        },
        null,
        2
      )
    );

    // Create large file (simulate)
    const largeFile = path.join(tempDir, "large_file.dat");
    const size = 5 * 1024 * 1024; // 5MB
    const buffer = Buffer.alloc(size);
    for (let i = 0; i < size; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    fs.writeFileSync(largeFile, buffer);

    // Create CSV file
    const csvFile = path.join(tempDir, "sample_data.csv");
    let csvContent = "id,name,email,age,city\n";
    for (let i = 1; i <= 1000; i++) {
      csvContent += `${i},User${i},user${i}@example.com,${20 + Math.floor(Math.random() * 40)},City${Math.floor(Math.random() * 10)}\n`;
    }
    fs.writeFileSync(csvFile, csvContent);

    console.log("Sample files created in:", tempDir);
    return tempDir;
  }

  /**
   * Exercise 1: Upload Files to GridFS
   */
  async uploadFiles() {
    console.log("\n=== Uploading files to GridFS ===\n");

    const tempDir = await this.createSampleFiles();
    const files = fs.readdirSync(tempDir);

    for (const filename of files) {
      const filePath = path.join(tempDir, filename);
      const stats = fs.statSync(filePath);

      console.log(`Uploading: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);

      // Create metadata
      const metadata = {
        originalName: filename,
        uploadDate: new Date(),
        size: stats.size,
        type: path.extname(filename),
        hash: crypto.createHash("md5").update(fs.readFileSync(filePath)).digest("hex"),
      };

      // Upload file
      const uploadStream = this.bucket.openUploadStream(filename, {
        metadata: metadata,
        contentType: this.getContentType(filename),
      });

      const fileStream = fs.createReadStream(filePath);

      await new Promise((resolve, reject) => {
        fileStream
          .pipe(uploadStream)
          .on("finish", () => {
            console.log(`  ✓ Uploaded with ID: ${uploadStream.id}`);
            resolve();
          })
          .on("error", reject);
      });
    }

    // Show GridFS collections
    console.log("\nGridFS Collections:");
    const filesCount = await this.db.collection("files.files").countDocuments();
    const chunksCount = await this.db.collection("files.chunks").countDocuments();
    console.log(`  - files.files: ${filesCount} documents`);
    console.log(`  - files.chunks: ${chunksCount} chunks`);
  }

  /**
   * Exercise 2: List and Search Files
   */
  async listFiles() {
    console.log("\n=== Listing files in GridFS ===\n");

    // List all files
    const files = await this.bucket.find({}).toArray();

    console.log("All files:");
    files.forEach((file) => {
      console.log(`  - ${file.filename}`);
      console.log(`    ID: ${file._id}`);
      console.log(`    Size: ${(file.length / 1024).toFixed(2)} KB`);
      console.log(`    Chunks: ${Math.ceil(file.length / file.chunkSize)}`);
      console.log(`    Upload Date: ${file.uploadDate}`);
      if (file.metadata) {
        console.log(`    Hash: ${file.metadata.hash}`);
      }
    });

    // Search for specific files
    console.log("\nSearching for JSON files:");
    const jsonFiles = await this.bucket
      .find({
        filename: { $regex: /\.json$/i },
      })
      .toArray();

    jsonFiles.forEach((file) => {
      console.log(`  - ${file.filename} (${(file.length / 1024).toFixed(2)} KB)`);
    });

    // Find large files
    console.log("\nFiles larger than 1MB:");
    const largeFiles = await this.bucket
      .find({
        length: { $gt: 1024 * 1024 },
      })
      .toArray();

    largeFiles.forEach((file) => {
      console.log(`  - ${file.filename} (${(file.length / 1024 / 1024).toFixed(2)} MB)`);
    });
  }

  /**
   * Exercise 3: Download Files from GridFS
   */
  async downloadFiles() {
    console.log("\n=== Downloading files from GridFS ===\n");

    const downloadDir = path.join(__dirname, "downloaded_files");
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // Find a file to download
    const file = await this.bucket.find({ filename: "sample_document.txt" }).next();

    if (file) {
      const downloadPath = path.join(downloadDir, `downloaded_${file.filename}`);
      console.log(`Downloading: ${file.filename} -> ${downloadPath}`);

      const downloadStream = this.bucket.openDownloadStream(file._id);
      const writeStream = fs.createWriteStream(downloadPath);

      await new Promise((resolve, reject) => {
        downloadStream
          .pipe(writeStream)
          .on("finish", () => {
            console.log(`  ✓ Downloaded successfully`);

            // Verify file integrity
            const downloadedHash = crypto
              .createHash("md5")
              .update(fs.readFileSync(downloadPath))
              .digest("hex");

            if (file.metadata && file.metadata.hash === downloadedHash) {
              console.log(`  ✓ File integrity verified (MD5: ${downloadedHash})`);
            }
            resolve();
          })
          .on("error", reject);
      });

      // Read and display content for text files
      if (file.filename.endsWith(".txt")) {
        const content = fs.readFileSync(downloadPath, "utf-8");
        console.log("\nFile content preview:");
        console.log(content.substring(0, 200) + "...");
      }
    }
  }

  /**
   * Exercise 4: Stream Processing
   * Process files without loading them entirely into memory
   */
  async streamProcessing() {
    console.log("\n=== Stream processing with GridFS ===\n");

    // Process CSV file line by line
    const csvFile = await this.bucket.find({ filename: "sample_data.csv" }).next();

    if (csvFile) {
      console.log(`Processing CSV file: ${csvFile.filename}`);

      const downloadStream = this.bucket.openDownloadStream(csvFile._id);
      let lineCount = 0;
      let buffer = "";
      let ageSum = 0;
      let ageCount = 0;

      await new Promise((resolve) => {
        downloadStream.on("data", (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split("\n");

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";

          lines.forEach((line) => {
            lineCount++;
            if (lineCount > 1 && line.trim()) {
              // Skip header
              const fields = line.split(",");
              if (fields[3]) {
                const age = parseInt(fields[3]);
                if (!isNaN(age)) {
                  ageSum += age;
                  ageCount++;
                }
              }
            }
          });
        });

        downloadStream.on("end", () => {
          // Process any remaining data
          if (buffer.trim()) {
            lineCount++;
          }

          console.log(`  Processed ${lineCount} lines`);
          if (ageCount > 0) {
            console.log(`  Average age: ${(ageSum / ageCount).toFixed(1)}`);
          }
          resolve();
        });
      });
    }
  }

  /**
   * Exercise 5: File Versioning
   * Implement file versioning with GridFS
   */
  async fileVersioning() {
    console.log("\n=== File versioning with GridFS ===\n");

    const filename = "config.json";

    // Upload version 1
    const v1Data = JSON.stringify({ version: 1, setting: "initial" });
    const v1Stream = this.bucket.openUploadStream(filename, {
      metadata: { version: 1, timestamp: new Date() },
    });
    v1Stream.end(Buffer.from(v1Data));
    await new Promise((resolve) => v1Stream.on("finish", resolve));
    console.log(`Uploaded ${filename} v1`);

    // Upload version 2
    const v2Data = JSON.stringify({ version: 2, setting: "updated" });
    const v2Stream = this.bucket.openUploadStream(filename, {
      metadata: { version: 2, timestamp: new Date() },
    });
    v2Stream.end(Buffer.from(v2Data));
    await new Promise((resolve) => v2Stream.on("finish", resolve));
    console.log(`Uploaded ${filename} v2`);

    // Upload version 3
    const v3Data = JSON.stringify({ version: 3, setting: "latest" });
    const v3Stream = this.bucket.openUploadStream(filename, {
      metadata: { version: 3, timestamp: new Date() },
    });
    v3Stream.end(Buffer.from(v3Data));
    await new Promise((resolve) => v3Stream.on("finish", resolve));
    console.log(`Uploaded ${filename} v3`);

    // List all versions
    console.log("\nAll versions:");
    const versions = await this.bucket
      .find({ filename })
      .sort({ "metadata.version": -1 })
      .toArray();

    for (const ver of versions) {
      console.log(`  v${ver.metadata.version} - ${ver.metadata.timestamp}`);

      // Read content
      const stream = this.bucket.openDownloadStream(ver._id);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const content = JSON.parse(Buffer.concat(chunks).toString());
      console.log(`    Content: ${JSON.stringify(content)}`);
    }

    // Get latest version
    const latest = versions[0];
    console.log(`\nLatest version: v${latest.metadata.version}`);
  }

  /**
   * Exercise 6: Image Thumbnail Generation
   * Simulate image processing with GridFS
   */
  async imageThumbnails() {
    console.log("\n=== Image processing with GridFS ===\n");

    // Simulate image upload
    const images = [
      { name: "photo1.jpg", size: 2048 * 1024 }, // 2MB
      { name: "photo2.jpg", size: 3072 * 1024 }, // 3MB
      { name: "photo3.jpg", size: 1536 * 1024 }, // 1.5MB
    ];

    for (const image of images) {
      // Upload original image (simulated)
      const originalData = Buffer.alloc(image.size);
      const uploadStream = this.bucket.openUploadStream(image.name, {
        metadata: {
          type: "original",
          dimensions: { width: 4000, height: 3000 },
          format: "jpeg",
        },
      });
      uploadStream.end(originalData);
      await new Promise((resolve) => uploadStream.on("finish", resolve));
      console.log(`Uploaded original: ${image.name}`);

      // Create and upload thumbnail (simulated)
      const thumbnailName = `thumb_${image.name}`;
      const thumbnailData = Buffer.alloc(50 * 1024); // 50KB thumbnail
      const thumbStream = this.bucket.openUploadStream(thumbnailName, {
        metadata: {
          type: "thumbnail",
          dimensions: { width: 200, height: 150 },
          format: "jpeg",
          originalFile: image.name,
        },
      });
      thumbStream.end(thumbnailData);
      await new Promise((resolve) => thumbStream.on("finish", resolve));
      console.log(`  Created thumbnail: ${thumbnailName}`);
    }

    // List all thumbnails
    console.log("\nThumbnails:");
    const thumbnails = await this.bucket
      .find({
        "metadata.type": "thumbnail",
      })
      .toArray();

    thumbnails.forEach((thumb) => {
      console.log(`  - ${thumb.filename}`);
      console.log(`    Original: ${thumb.metadata.originalFile}`);
      console.log(
        `    Dimensions: ${thumb.metadata.dimensions.width}x${thumb.metadata.dimensions.height}`
      );
    });
  }

  /**
   * Exercise 7: Delete and Cleanup
   */
  async deleteFiles() {
    console.log("\n=== Deleting files from GridFS ===\n");

    // Find and delete specific file
    const file = await this.bucket.find({ filename: "large_file.dat" }).next();

    if (file) {
      console.log(`Deleting: ${file.filename}`);
      await this.bucket.delete(file._id);
      console.log("  ✓ File deleted");
    }

    // Delete by metadata
    console.log("\nDeleting all thumbnails:");
    const thumbnails = await this.bucket
      .find({
        "metadata.type": "thumbnail",
      })
      .toArray();

    for (const thumb of thumbnails) {
      await this.bucket.delete(thumb._id);
      console.log(`  ✓ Deleted: ${thumb.filename}`);
    }

    // Rename a file
    const renameFile = await this.bucket.find({ filename: "sample_data.json" }).next();
    if (renameFile) {
      await this.bucket.rename(renameFile._id, "renamed_data.json");
      console.log("\n✓ Renamed sample_data.json to renamed_data.json");
    }
  }

  /**
   * Exercise 8: GridFS Statistics
   */
  async gridfsStats() {
    console.log("\n=== GridFS Statistics ===\n");

    const files = await this.bucket.find({}).toArray();
    const chunks = await this.db.collection("files.chunks").find({}).toArray();

    // Calculate statistics
    const stats = {
      totalFiles: files.length,
      totalChunks: chunks.length,
      totalSize: files.reduce((sum, file) => sum + file.length, 0),
      avgFileSize: 0,
      largestFile: null,
      smallestFile: null,
      fileTypes: {},
    };

    if (files.length > 0) {
      stats.avgFileSize = stats.totalSize / files.length;
      stats.largestFile = files.reduce(
        (max, file) => (file.length > (max?.length || 0) ? file : max),
        null
      );
      stats.smallestFile = files.reduce(
        (min, file) => (file.length < (min?.length || Infinity) ? file : min),
        null
      );
    }

    // Count file types
    files.forEach((file) => {
      const ext = path.extname(file.filename) || "no extension";
      stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
    });

    console.log("GridFS Statistics:");
    console.log(`  Total Files: ${stats.totalFiles}`);
    console.log(`  Total Chunks: ${stats.totalChunks}`);
    console.log(`  Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Average File Size: ${(stats.avgFileSize / 1024).toFixed(2)} KB`);

    if (stats.largestFile) {
      console.log(
        `  Largest File: ${stats.largestFile.filename} (${(stats.largestFile.length / 1024 / 1024).toFixed(2)} MB)`
      );
    }
    if (stats.smallestFile) {
      console.log(
        `  Smallest File: ${stats.smallestFile.filename} (${(stats.smallestFile.length / 1024).toFixed(2)} KB)`
      );
    }

    console.log("\nFile Types:");
    Object.entries(stats.fileTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} files`);
    });
  }

  /**
   * Helper: Get content type from filename
   */
  getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      ".txt": "text/plain",
      ".json": "application/json",
      ".csv": "text/csv",
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
    };
    return contentTypes[ext] || "application/octet-stream";
  }

  async cleanup() {
    // Clean up GridFS
    console.log("\nCleaning up GridFS...");

    // Drop GridFS collections
    await this.db
      .collection("files.files")
      .drop()
      .catch(() => {});
    await this.db
      .collection("files.chunks")
      .drop()
      .catch(() => {});

    // Clean up temp directories
    const tempDir = path.join(__dirname, "temp_files");
    const downloadDir = path.join(__dirname, "downloaded_files");

    [tempDir, downloadDir].forEach((dir) => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });

    await this.client.close();
    console.log("Cleanup completed");
  }
}

// Main execution
async function main() {
  const exercises = new GridFSExercises();

  try {
    await exercises.connect();

    console.log("=== GridFS File Storage Exercises ===\n");

    await exercises.uploadFiles();
    await exercises.listFiles();
    await exercises.downloadFiles();
    await exercises.streamProcessing();
    await exercises.fileVersioning();
    await exercises.imageThumbnails();
    await exercises.deleteFiles();
    await exercises.gridfsStats();
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await exercises.cleanup();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = GridFSExercises;
