import * as FileSystem from 'expo-file-system/legacy';
import { Phone } from '@/types/phone';

// Freehostia free plan has no SSL, so this is plain HTTP. Cleartext access to
// this host is permitted via app.json (Android usesCleartextTraffic + iOS ATS).
const BASE_URL = 'http://dlasala.duckdns.org/phones.php';

const AUTH_TOKEN = 'Bearer dwyn-students-api-8f92k3';

const HEADERS: HeadersInit = {
  'Authorization': AUTH_TOKEN,
  'Content-Type': 'application/json',
};

/** True for a locally-picked file (file://, content://, ph://) — i.e. something
 *  we must upload. An http(s) URL is already hosted and is sent as text. */
function isLocalFile(uri?: string): uri is string {
  return !!uri && !/^https?:\/\//i.test(uri);
}

function mimeFor(uri: string): string {
  const ext = (/\.(\w+)(?:\?.*)?$/.exec(uri)?.[1] || 'jpg').toLowerCase();
  return ext === 'png' ? 'image/png'
    : ext === 'webp' ? 'image/webp'
    : ext === 'gif' ? 'image/gif'
    : 'image/jpeg';
}

/**
 * Send a create/update as a native multipart upload with the picked image.
 * Used instead of fetch()+FormData because SDK 57's global fetch is Expo's,
 * whose FormData rejects React Native's {uri,name,type} file part. uploadAsync
 * builds the multipart body natively from the file URI, and sends the other
 * fields as ordinary form-data parameters.
 */
async function uploadWithImage(
  imageUri: string,
  parameters: Record<string, string>
): Promise<boolean> {
  const result = await FileSystem.uploadAsync(BASE_URL, imageUri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'image',
    mimeType: mimeFor(imageUri),
    parameters,
    headers: { Authorization: AUTH_TOKEN },
  });
  return result.status >= 200 && result.status < 300;
}

export async function getPhones(): Promise<Phone[]> {
  try {
    const response = await fetch(BASE_URL, { method: 'GET', headers: HEADERS });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data: Phone[] = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch phones:', error);
    return [];
  }
}

export async function getPhone(id: number): Promise<Phone> {
  try {
    const response = await fetch(`${BASE_URL}?id=${id}`, { method: 'GET', headers: HEADERS });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data: Phone = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch phone ${id}:`, error);
    throw error;
  }
}

export async function createPhone(
  phone: Omit<Phone, 'id'>,
  imageUri?: string
): Promise<boolean> {
  try {
    const fields: Record<string, string> = {
      name: phone.name,
      brand: phone.brand,
      model: phone.model,
      price: phone.price.toString(),
      description: phone.description,
      image_url: phone.image_url,
    };

    if (isLocalFile(imageUri)) {
      return await uploadWithImage(imageUri, fields);
    }

    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { Authorization: AUTH_TOKEN },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Failed to create phone:', error);
    return false;
  }
}

export async function updatePhone(phone: Phone, imageUri?: string): Promise<boolean> {
  try {
    const fields: Record<string, string> = {
      _method: 'PUT',
      id: phone.id.toString(),
      name: phone.name,
      brand: phone.brand,
      model: phone.model,
      price: phone.price.toString(),
      description: phone.description,
      image_url: phone.image_url,
    };

    if (isLocalFile(imageUri)) {
      return await uploadWithImage(imageUri, fields);
    }

    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { Authorization: AUTH_TOKEN },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Failed to update phone:', error);
    return false;
  }
}

export async function deletePhone(id: number): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('_method', 'DELETE');
    formData.append('id', id.toString());

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { Authorization: AUTH_TOKEN },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to delete phone ${id}:`, error);
    return false;
  }
}
