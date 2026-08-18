'use client';

import { PlaygroundProvider } from '@/components/PlaygroundProvider';
import { PrivacyGuardProvider } from '@/components/PrivacyGuard';
import { CredentialGate } from '@/components/CredentialGate';
import { Sidebar } from '@/components/Sidebar';

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivacyGuardProvider>
      <PlaygroundProvider>
        <CredentialGate>
          <div className="flex min-h-[calc(100vh-41px)]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6">
                {children}
              </div>
            </main>
          </div>
        </CredentialGate>
      </PlaygroundProvider>
    </PrivacyGuardProvider>
  );
}
