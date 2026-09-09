'use client';

import { SimpleMethodPage } from '@/components/SimpleMethodPage';

export default function ProfilePage() {
  return (
    <SimpleMethodPage
      title="getProfile"
      description="Get the authenticated user's profile information including wallet balance."
      methodName="getProfile"
    />
  );
}
