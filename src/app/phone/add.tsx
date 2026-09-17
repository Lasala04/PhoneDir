import React from 'react';
import { useRouter } from 'expo-router';
import { createPhone } from '@/services/api';
import PhoneForm from '@/components/PhoneForm';

export default function AddPhoneScreen() {
  const router = useRouter();

  return (
    <PhoneForm
      submitLabel="COMMIT RECORD"
      successMessage="Record added to catalog."
      onSubmit={createPhone}
      onSuccess={() => router.back()}
    />
  );
}
