// midbar-cipher.ts
import CryptoJS from "crypto-js";

function hexStringToArray(hexString: string): Uint8Array {
  const result: number[] = [];
  for (let i = 0; i < hexString.length; i += 2) {
    result.push(parseInt(hexString.substring(i, i + 2), 16));
  }
  return new Uint8Array(result);
}

function incrAesKey(key: Uint8Array): Uint8Array {
  const nextKey = new Uint8Array(key);
  for (let i = 15; i >= 0; i--) {
    if (nextKey[i] === 255) {
      nextKey[i] = 0;
    } else {
      nextKey[i] += 1;
      break;
    }
  }
  return nextKey;
}

function encryptAES256ECB(block: Uint8Array, key: Uint8Array): Uint8Array {
  const blockWords = CryptoJS.lib.WordArray.create(block as any);
  const keyWords = CryptoJS.lib.WordArray.create(key as any);
  const encrypted = CryptoJS.AES.encrypt(blockWords, keyWords, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  });
  const encryptedArray = new Uint8Array(encrypted.ciphertext.words.length * 4);
  for (let i = 0; i < encrypted.ciphertext.words.length; i++) {
    const word = encrypted.ciphertext.words[i];
    encryptedArray[i * 4] = (word >> 24) & 0xff;
    encryptedArray[i * 4 + 1] = (word >> 16) & 0xff;
    encryptedArray[i * 4 + 2] = (word >> 8) & 0xff;
    encryptedArray[i * 4 + 3] = word & 0xff;
  }
  return encryptedArray.slice(0, 16);
}

function decryptAES256ECB(block: Uint8Array, key: Uint8Array): Uint8Array {
  const blockWords = CryptoJS.lib.WordArray.create(block as any);
  const keyWords = CryptoJS.lib.WordArray.create(key as any);
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: blockWords } as any, keyWords, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  });
  const decryptedArray = new Uint8Array(decrypted.words.length * 4);
  for (let i = 0; i < decrypted.words.length; i++) {
    const word = decrypted.words[i];
    decryptedArray[i * 4] = (word >> 24) & 0xff;
    decryptedArray[i * 4 + 1] = (word >> 16) & 0xff;
    decryptedArray[i * 4 + 2] = (word >> 8) & 0xff;
    decryptedArray[i * 4 + 3] = word & 0xff;
  }
  return decryptedArray.slice(0, 16);
}

export function encryptStringWithMidbarAES256CBC(input: string, key: string): string {
  const chunkSize = 16;
  const encryptedChunks: number[] = [];
  
  const sha512HashString = CryptoJS.SHA512(key).toString();
  const sha512Array = hexStringToArray(sha512HashString);
  
  let rightHalf = sha512Array.slice(sha512Array.length / 2);
  const leftHalfForHMAC = sha512HashString.slice(0, sha512HashString.length / 2);
  const leftHalfWordArray = CryptoJS.enc.Hex.parse(leftHalfForHMAC);
  const hmacString = CryptoJS.HmacSHA256(input, leftHalfWordArray).toString();
  
  const iv = new Uint8Array(16);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(iv);
  } else {
    for (let i = 0; i < 16; i++) iv[i] = Math.floor(Math.random() * 256);
  }

  let aesKeyForIV = new Uint8Array(32);
  aesKeyForIV.set(rightHalf);

  const encryptedIV = encryptAES256ECB(iv, aesKeyForIV);
  encryptedIV.forEach(byte => encryptedChunks.push(byte));
  rightHalf = incrAesKey(rightHalf);

  let previousCiphertext = new Uint8Array(iv);

  const hmacArray = hexStringToArray(hmacString);
  const inputArray = new TextEncoder().encode(input);
  const dataToEncrypt = new Uint8Array([...hmacArray, ...inputArray]);

  for (let i = 0; i < dataToEncrypt.length; i += chunkSize) {
    let chunk = dataToEncrypt.slice(i, i + chunkSize);
    if (chunk.length < chunkSize) {
      const padded = new Uint8Array(chunkSize);
      padded.set(chunk);
      chunk = padded;
    }

    const xorChunk = chunk.map((byte, index) => byte ^ previousCiphertext[index]);
    const encryptedChunk = encryptAES256ECB(xorChunk, rightHalf);
    encryptedChunk.forEach(byte => encryptedChunks.push(byte));

    previousCiphertext = new Uint8Array(encryptedChunk);
    rightHalf = incrAesKey(rightHalf);
  }

  return Array.from(encryptedChunks)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function decryptStringWithMidbarAES256CBC(input: string, key: string): { data: string; statusKey: "decryption_success" | "decryption_failed" } {
  const chunkSize = 16;
  const sha512HashString = CryptoJS.SHA512(key).toString();
  const sha512Array = hexStringToArray(sha512HashString);

  if (input.length < 96) {
    return { data: "", statusKey: "decryption_failed" };
  }

  const ciphertextArray = new Uint8Array(hexStringToArray(input));
  let rightHalf = sha512Array.slice(sha512Array.length / 2);
  
  let aesKeyForIV = new Uint8Array(32);
  aesKeyForIV.set(rightHalf);

  const decryptedIV = decryptAES256ECB(ciphertextArray.slice(0, 16), aesKeyForIV);
  rightHalf = incrAesKey(rightHalf);

  const decryptedTag: number[] = [];
  const decryptedData: number[] = [];
  
  let arrayForCbcMode = new Uint8Array(decryptedIV);
  let decract = 10; 

  for (let i = chunkSize; i < ciphertextArray.length; i += chunkSize) {
    const chunk = new Uint8Array(ciphertextArray.slice(i, i + chunkSize));
    
    const prevRes = new Uint8Array(16);
    if (i - chunkSize >= 0) {
      prevRes.set(ciphertextArray.slice(i - chunkSize, i));
    }

    if (decract > 16) {
      arrayForCbcMode = new Uint8Array(prevRes);
    }

    const decryptedChunk = decryptAES256ECB(chunk, rightHalf);
    rightHalf = incrAesKey(rightHalf);

    const xorChunk = decryptedChunk.map((byte, index) => byte ^ arrayForCbcMode[index]);

    if (decract < 22) {
      xorChunk.forEach(byte => decryptedTag.push(byte));
    } else {
      xorChunk.forEach(byte => decryptedData.push(byte));
    }
    
    decract += 11;
  }

  let decrDataStr = '';
  for (let i = 0; i < decryptedData.length; i++) {
    if (decryptedData[i] > 0) {
      decrDataStr += String.fromCharCode(decryptedData[i]);
    }
  }

  const leftHalfForHMAC = sha512HashString.slice(0, sha512HashString.length / 2);
  const leftHalfWordArray = CryptoJS.enc.Hex.parse(leftHalfForHMAC);
  const hmacString = CryptoJS.HmacSHA256(decrDataStr, leftHalfWordArray).toString();
  const hmacArray = hexStringToArray(hmacString);

  let verified = true;
  for (let i = 0; i < decryptedTag.length; i++) {
    if (decryptedTag[i] !== hmacArray[i]) {
      verified = false;
      break;
    }
  }

  return { 
    data: decrDataStr, 
    statusKey: (verified && decrDataStr.length > 0) ? "decryption_success" : "decryption_failed" 
  };
}