import Store from "electron-store";
import * as crypto from "crypto";

class SecureTokenManager {
  private store: Store;
  private readonly encryptionKey: Buffer;
  private readonly IV_LENGTH: number = 16;
  private readonly SALT_LENGTH: number = 16;
  private readonly ENCRYPTION_KEY_LENGTH: number = 32;

  constructor(masterKey: string = "your-secret-master-key") {
    // Generate a consistent encryption key from the master key
    const salt = crypto.scryptSync(
      masterKey,
      "fixed-salt",
      this.ENCRYPTION_KEY_LENGTH
    );
    this.encryptionKey = salt;

    // Initialize electron-store
    this.store = new Store({
      name: "secure-tokens", // Name of the storage file
      encryptionKey: masterKey, // Built-in encryption by electron-store
    });
  }

  private encrypt(text: string): string {
    // Generate a random IV for each encryption
    const iv = crypto.randomBytes(this.IV_LENGTH);

    // Create cipher with AES-256-GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", this.encryptionKey, iv);

    // Encrypt the data
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Combine IV, encrypted data, and auth tag
    return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`;
  }

  private decrypt(encryptedData: string): string {
    try {
      // Split the stored data into IV, encrypted text, and auth tag
      const [ivHex, encryptedText, authTagHex] = encryptedData.split(":");

      if (!ivHex || !encryptedText || !authTagHex) {
        throw new Error("Invalid encrypted data format");
      }

      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");

      // Create decipher
      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        this.encryptionKey,
        iv
      );

      // Set auth tag for verification
      decipher.setAuthTag(authTag);

      // Decrypt the data
      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new Error("Failed to decrypt data: " + (error as Error).message);
    }
  }

  /**
   * Store a token securely
   * @param tokenType The type of token (e.g., 'id_token', 'refresh_token')
   * @param token The token value to store
   */
  storeToken(tokenType: string, token: string): void {
    try {
      const encryptedToken = this.encrypt(token);
      this.store.set(tokenType, encryptedToken);
    } catch (error) {
      console.error(`Error storing ${tokenType}:`, error);
      throw new Error(`Failed to store ${tokenType}`);
    }
  }

  /**
   * Retrieve a stored token
   * @param tokenType The type of token to retrieve
   * @returns The decrypted token or null if not found
   */
  retrieveToken(tokenType: string): string | null {
    try {
      const encryptedToken = this.store.get(tokenType) as string | undefined;

      if (!encryptedToken) {
        return null;
      }

      return this.decrypt(encryptedToken);
    } catch (error) {
      console.error(`Error retrieving ${tokenType}:`, error);
      throw new Error(`Failed to retrieve ${tokenType}`);
    }
  }

  /**
   * Delete a specific token
   * @param tokenType The type of token to delete
   */
  deleteToken(tokenType: string): void {
    try {
      this.store.delete(tokenType);
    } catch (error) {
      console.error(`Error deleting ${tokenType}:`, error);
      throw new Error(`Failed to delete ${tokenType}`);
    }
  }

  /**
   * Clear all stored tokens
   */
  clearAllTokens(): void {
    try {
      this.store.clear();
    } catch (error) {
      console.error("Error clearing tokens:", error);
      throw new Error("Failed to clear all tokens");
    }
  }

  /**
   * Check if a token exists
   * @param tokenType The type of token to check
   */
  hasToken(tokenType: string): boolean {
    return this.store.has(tokenType);
  }

  /**
   * Get all stored token types
   * @returns Array of token type strings
   */
  getStoredTokenTypes(): string[] {
    return Object.keys(this.store.store);
  }
}

export default SecureTokenManager;
