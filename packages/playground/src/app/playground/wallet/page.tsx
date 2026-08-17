'use client';

import { SimpleMethodPage } from '@/components/SimpleMethodPage';

export default function WalletPage() {
  return (
    <SimpleMethodPage
      title="getWalletBalance"
      description="Retrieve your current wallet balance. This also validates that your credentials are correct."
      methodName="getWalletBalance"
    />
  );
}
