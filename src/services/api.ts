import { Phone } from '@/types/phone';

const BASE_URL = 'http://your-api-url.com/phones.php';

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

export async function createPhone(phone: Omit<Phone, 'id'>): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('name', phone.name);
    formData.append('brand', phone.brand);
    formData.append('model', phone.model);
    formData.append('price', phone.price.toString());
    formData.append('description', phone.description);
    formData.append('image_url', phone.image_url);

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

export async function updatePhone(phone: Phone): Promise<boolean> {
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
