import { Phone } from '@/types/phone';

// Freehostia free plan has no SSL, so this is plain HTTP. Cleartext access to
// this host is permitted via app.json (Android usesCleartextTraffic + iOS ATS).
const BASE_URL = 'http://dlasala.duckdns.org/phones.php';

const HEADERS: HeadersInit = {
  'Authorization': 'Bearer dwyn-students-api-8f92k3',
  'Content-Type': 'application/json',
};

export async function getPhones(): Promise<Phone[]> {
  try {
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: HEADERS,
    });
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
    const response = await fetch(`${BASE_URL}?id=${id}`, {
      method: 'GET',
      headers: HEADERS,
    });
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

/**
 * Attach a locally-picked image file to the request. A picked photo has a
 * device URI (file://, content://, ph://); an already-hosted image is an
 * http(s) URL and is sent as text via image_url instead, not re-uploaded.
 */
function appendImageFile(formData: FormData, imageUri?: string): void {
  if (!imageUri || /^https?:\/\//i.test(imageUri)) return;
  const ext = (/\.(\w+)(?:\?.*)?$/.exec(imageUri)?.[1] || 'jpg').toLowerCase();
  const type =
    ext === 'png' ? 'image/png'
    : ext === 'webp' ? 'image/webp'
    : ext === 'gif' ? 'image/gif'
    : 'image/jpeg';
  // React Native FormData accepts this {uri,name,type} shape for file parts.
  formData.append('image', { uri: imageUri, name: `upload.${ext}`, type } as any);
}

export async function createPhone(
  phone: Omit<Phone, 'id'>,
  imageUri?: string
): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('name', phone.name);
    formData.append('brand', phone.brand);
    formData.append('model', phone.model);
    formData.append('price', phone.price.toString());
    formData.append('description', phone.description);
    formData.append('image_url', phone.image_url);
    appendImageFile(formData, imageUri);

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer dwyn-students-api-8f92k3',
      },
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
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('id', phone.id.toString());
    formData.append('name', phone.name);
    formData.append('brand', phone.brand);
    formData.append('model', phone.model);
    formData.append('price', phone.price.toString());
    formData.append('description', phone.description);
    formData.append('image_url', phone.image_url);
    appendImageFile(formData, imageUri);

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer dwyn-students-api-8f92k3',
      },
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
      headers: {
        'Authorization': 'Bearer dwyn-students-api-8f92k3',
      },
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
