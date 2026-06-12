import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_ENV_VAR = 'ENCRYPTION_KEY';

function getKey(): Buffer {
  const key = process.env[KEY_ENV_VAR];
  if (!key) {
    throw new Error(
      `Missing ${KEY_ENV_VAR} environment variable for encryption`
    );
  }

  const keyBuffer = Buffer.from(key, 'hex');

  if (keyBuffer.length !== 32) {
    throw new Error(
      `Invalid encryption key length: expected 32 bytes (64 hex chars), got ${keyBuffer.length}`
    );
  }

  return keyBuffer;
}

export function encrypt(
  text: string
): { encryptedData: string; iv: string; authTag: string } {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

export function decrypt(
  encryptedData: string,
  iv: string,
  authTag: string
): string {
  const key = getKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
