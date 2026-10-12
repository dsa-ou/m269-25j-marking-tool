// al_tests.enc at the top of the repo, bundled as text (see webpack.config.js).
// The path works from both src/alTests/ and the compiled lib/alTests/.
import ENCRYPTED_BASE64 from '../../al_tests.enc';

export async function decrypt(keyText: string): Promise<string> {
  const encryptedBytes = Uint8Array.from(atob(ENCRYPTED_BASE64.trim()), c => c.charCodeAt(0));
  const iv = encryptedBytes.slice(0, 12);
  const ciphertext = encryptedBytes.slice(12);

  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyText);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decryptedBuffer);
}
